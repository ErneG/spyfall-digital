"use server";

import {
  startGameInput,
  castVoteInput,
  endGameInput,
  restartGameInput,
  timerToggleInput,
  type StartGameOutput,
  type GameView,
} from "@/domains/game/schema";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";
import { prisma } from "@/shared/lib/prisma";
import { assignRoles, MIN_PLAYERS, shuffle } from "@/domains/game/logic";

// ─── Helpers ────────────────────────────────────────────────

function calculateTimeRemaining(
  isTimerRunning: boolean,
  timerPausedAt: Date | null,
  startedAt: Date,
  timeLimit: number,
): number {
  if (!isTimerRunning && timerPausedAt) {
    const elapsedBeforePause = Math.floor((timerPausedAt.getTime() - startedAt.getTime()) / 1000);
    return Math.max(0, timeLimit - elapsedBeforePause);
  }
  const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  return Math.max(0, timeLimit - elapsed);
}

async function fetchCombinedLocations(roomId: string) {
  const [allLocations, customLocations] = await Promise.all([
    prisma.location.findMany({
      select: { id: true, name: true, imageUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.customLocation.findMany({
      where: { roomId, selected: true, allSpies: false },
      select: { id: true, name: true },
    }),
  ]);

  return [
    ...allLocations,
    ...customLocations.map((cl) => ({ id: cl.id, name: cl.name, imageUrl: null })),
  ].sort((a, b) => a.name.localeCompare(b.name));
}

const REVEAL_STATES = new Set(["REVEAL", "FINISHED"]);

type LocationCandidate = {
  type: "builtin" | "custom";
  id: string | null;
  name: string;
  roles: string[];
  isAllSpies: boolean;
};

async function buildCandidates(
  selectedLocationIds: string[],
  customLocations: Array<{
    id: string;
    name: string;
    allSpies: boolean;
    roles: Array<{ name: string }>;
  }>,
): Promise<LocationCandidate[]> {
  const builtInLocations =
    selectedLocationIds.length > 0
      ? await prisma.location.findMany({
          where: { id: { in: selectedLocationIds } },
          include: { roles: true },
        })
      : [];

  return [
    ...builtInLocations.map((location) => ({
      type: "builtin" as const,
      id: location.id,
      name: location.name,
      roles: location.roles.map((r) => r.name),
      isAllSpies: false,
    })),
    ...customLocations.map((cl) => ({
      type: "custom" as const,
      id: cl.id,
      name: cl.allSpies ? "?????" : cl.name,
      roles: cl.roles.map((r) => r.name),
      isAllSpies: cl.allSpies,
    })),
  ];
}

function pickLocation(
  candidates: LocationCandidate[],
  isModeratorMode: boolean,
  moderatorLocationId: string | null,
  previousLocationId: string | null,
): LocationCandidate {
  if (isModeratorMode && moderatorLocationId) {
    const moderatorChoice = candidates.find((c) => c.id === moderatorLocationId);
    return moderatorChoice ?? shuffle(candidates)[0];
  }

  const filtered =
    candidates.length > 1 && previousLocationId
      ? candidates.filter((c) => c.id !== previousLocationId)
      : candidates;

  return shuffle(filtered)[0];
}

// ─── Server Actions ─────────────────────────────────────────

/** Start a new game round in a room (host only). */
export async function startGame(input: unknown): Promise<ActionResult<StartGameOutput>> {
  const parsed = startGameInput.safeParse(input);
  if (!parsed.success) {
    return fail("roomId and playerId are required");
  }

  const { roomId, playerId } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        players: true,
        selectedLocations: { select: { locationId: true } },
        customLocations: {
          where: { selected: true },
          include: { roles: true },
        },
      },
    });

    if (!room) return fail("Room not found");
    if (room.hostId !== playerId) return fail("Only the host can start");
    if (room.players.length < MIN_PLAYERS) {
      return fail(`Need at least ${MIN_PLAYERS} players`);
    }

    const candidates = await buildCandidates(
      room.selectedLocations.map((sl) => sl.locationId),
      room.customLocations,
    );

    if (candidates.length === 0) {
      return fail("No locations selected");
    }

    const chosen = pickLocation(
      candidates,
      room.moderatorMode,
      room.moderatorLocationId,
      room.prevLocationId,
    );
    const playerIds = room.players.map((p) => p.id);

    const moderatorAssignments = room.moderatorMode
      ? room.players
          .filter((p) => p.moderatorRole)
          .map((p) => ({ playerId: p.id, role: p.moderatorRole ?? "SPY" }))
      : [];

    const assignments = chosen.isAllSpies
      ? playerIds.map((pid) => ({
          playerId: pid,
          role: "SPY",
          isSpy: true,
        }))
      : assignRoles(playerIds, chosen.roles, room.spyCount, moderatorAssignments);

    const game = await prisma.$transaction(async (tx) => {
      const newGame = await tx.game.create({
        data: {
          roomId: room.id,
          locationId: chosen.type === "builtin" ? chosen.id : null,
          locationName: chosen.name,
          state: "PLAYING",
          timerRunning: room.autoStartTimer,
          assignments: {
            create: assignments.map((a) => ({
              playerId: a.playerId,
              role: a.role,
              isSpy: a.isSpy,
            })),
          },
        },
      });

      await tx.room.update({
        where: { id: room.id },
        data: { state: "PLAYING", prevLocationId: chosen.id },
      });

      if (room.moderatorMode) {
        await tx.player.updateMany({
          where: { roomId: room.id },
          data: { moderatorRole: null },
        });
      }

      return newGame;
    });

    return ok({
      gameId: game.id,
      state: game.state,
      startedAt: game.startedAt.toISOString(),
      timerRunning: game.timerRunning,
    });
  } catch (error) {
    console.error("Failed to start game:", error);
    return fail("Failed to start game");
  }
}

/** Cast a vote against a suspect. */
export async function castVote(
  input: unknown,
): Promise<ActionResult<{ success: true; votesIn: number; totalPlayers: number }>> {
  const parsed = castVoteInput.safeParse(input);
  if (!parsed.success) {
    return fail("gameId, voterId and suspectId are required");
  }

  const { gameId, voterId, suspectId } = parsed.data;

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        assignments: true,
        room: { include: { players: true } },
        votes: true,
      },
    });

    if (!game) return fail("Game not found");

    if (game.state !== "PLAYING" && game.state !== "VOTING") {
      return fail("Voting is not allowed in this phase");
    }

    if (voterId === suspectId) {
      return fail("Cannot vote for yourself");
    }

    const playerIds = new Set(game.room.players.map((p) => p.id));
    if (!playerIds.has(voterId) || !playerIds.has(suspectId)) {
      return fail("Invalid player");
    }

    await prisma.vote.upsert({
      where: { gameId_voterId: { gameId, voterId } },
      update: { suspectId },
      create: { gameId, voterId, suspectId },
    });

    const totalVotes = await prisma.vote.count({ where: { gameId } });
    const totalPlayers = game.room.players.length;

    if (totalVotes >= totalPlayers) {
      await prisma.$transaction([
        prisma.game.update({
          where: { id: gameId },
          data: { state: "REVEAL", endedAt: new Date() },
        }),
        prisma.room.update({
          where: { id: game.roomId },
          data: { state: "REVEAL" },
        }),
      ]);
    } else if (game.state !== "VOTING") {
      await prisma.$transaction([
        prisma.game.update({
          where: { id: gameId },
          data: { state: "VOTING" },
        }),
        prisma.room.update({
          where: { id: game.roomId },
          data: { state: "VOTING" },
        }),
      ]);
    }

    return ok({ success: true as const, votesIn: totalVotes, totalPlayers });
  } catch (error) {
    console.error("Failed to cast vote:", error);
    return fail("Failed to cast vote");
  }
}

/** End the game (host action or spy guessing location). */
export async function endGame(input: unknown): Promise<
  ActionResult<{
    ended: boolean;
    spyGuessedCorrectly?: boolean;
    spyWins?: boolean;
  }>
> {
  const parsed = endGameInput.safeParse(input);
  if (!parsed.success) {
    return fail("gameId and playerId are required");
  }

  const { gameId, playerId, spyGuessLocationId } = parsed.data;

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        room: true,
        assignments: true,
      },
    });

    if (!game) return fail("Game not found");

    if (game.state !== "PLAYING" && game.state !== "VOTING") {
      return fail("Game is not active");
    }

    const assignment = game.assignments.find((a) => a.playerId === playerId);
    if (!assignment) return fail("Player not in this game");

    // Spy guessing location
    if (spyGuessLocationId && assignment.isSpy) {
      const isCorrectGuess = spyGuessLocationId === game.locationId;
      await prisma.$transaction([
        prisma.game.update({
          where: { id: gameId },
          data: { state: "REVEAL", endedAt: new Date() },
        }),
        prisma.room.update({
          where: { id: game.roomId },
          data: { state: "REVEAL" },
        }),
      ]);

      return ok({
        ended: true,
        spyGuessedCorrectly: isCorrectGuess,
        spyWins: isCorrectGuess,
      });
    }

    // Host ending the game
    if (game.room.hostId === playerId) {
      await prisma.$transaction([
        prisma.game.update({
          where: { id: gameId },
          data: { state: "REVEAL", endedAt: new Date() },
        }),
        prisma.room.update({
          where: { id: game.roomId },
          data: { state: "REVEAL" },
        }),
      ]);

      return ok({ ended: true });
    }

    return fail("Not authorized to end the game");
  } catch (error) {
    console.error("Failed to end game:", error);
    return fail("Failed to end game");
  }
}

/** Return room to lobby for a new round (host only). */
export async function restartGame(input: unknown): Promise<ActionResult<{ success: true }>> {
  const parsed = restartGameInput.safeParse(input);
  if (!parsed.success) {
    return fail("gameId and playerId are required");
  }

  const { gameId, playerId } = parsed.data;

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { room: true },
    });

    if (!game) return fail("Game not found");
    if (game.room.hostId !== playerId) return fail("Only the host can restart");

    await prisma.$transaction([
      prisma.game.update({
        where: { id: gameId },
        data: { state: "FINISHED" },
      }),
      prisma.room.update({
        where: { id: game.roomId },
        data: { state: "LOBBY" },
      }),
    ]);

    return ok({ success: true as const });
  } catch (error) {
    console.error("Failed to restart:", error);
    return fail("Failed to restart");
  }
}

/** Get game state for a specific player (replaces GET /api/games/[id]). */
export async function getGameState(
  gameId: string,
  playerId: string,
): Promise<ActionResult<GameView>> {
  if (!gameId || !playerId) {
    return fail("gameId and playerId are required");
  }

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        location: true,
        assignments: true,
        room: {
          include: {
            players: {
              orderBy: { createdAt: "asc" },
              select: { id: true, name: true, isHost: true, isOnline: true },
            },
          },
        },
        votes: true,
      },
    });

    if (!game) return fail("Game not found");

    const myAssignment = game.assignments.find((a) => a.playerId === playerId);
    if (!myAssignment) return fail("Player not in this game");

    const [combinedLocations, previousLocation] = await Promise.all([
      fetchCombinedLocations(game.roomId),
      game.room.prevLocationId
        ? prisma.location.findUnique({
            where: { id: game.room.prevLocationId },
            select: { name: true },
          })
        : null,
    ]);

    const timeRemaining = calculateTimeRemaining(
      game.timerRunning,
      game.timerPausedAt,
      game.startedAt,
      game.room.timeLimit,
    );

    const isRevealPhase = REVEAL_STATES.has(game.state);

    return ok({
      gameId: game.id,
      phase: game.state as GameView["phase"],
      myRole: myAssignment.role,
      isSpy: myAssignment.isSpy,
      location: myAssignment.isSpy ? null : game.locationName,
      allLocations: combinedLocations,
      players: game.room.players,
      timeRemaining,
      timeLimit: game.room.timeLimit,
      startedAt: game.startedAt.toISOString(),
      timerRunning: game.timerRunning,
      hideSpyCount: game.room.hideSpyCount,
      spyCount: game.room.spyCount,
      prevLocationName: previousLocation?.name ?? null,
      votes: isRevealPhase
        ? game.votes.map((v) => ({ voterId: v.voterId, suspectId: v.suspectId }))
        : undefined,
      spies: isRevealPhase
        ? game.assignments.filter((a) => a.isSpy).map((a) => a.playerId)
        : undefined,
      revealedLocation: isRevealPhase ? game.locationName : undefined,
    });
  } catch (error) {
    console.error("Failed to get game state:", error);
    return fail("Failed to get game state");
  }
}

/** Pause or resume the game timer (host only). */
export async function toggleTimer(
  input: unknown,
): Promise<ActionResult<{ success: true; timerRunning: boolean }>> {
  const parsed = timerToggleInput.safeParse(input);
  if (!parsed.success) {
    return fail("gameId, playerId and action are required");
  }

  const { gameId, playerId, action } = parsed.data;

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { room: true },
    });

    if (!game) return fail("Game not found");
    if (game.room.hostId !== playerId) {
      return fail("Only the host can control the timer");
    }

    if (action === "pause" && game.timerRunning) {
      await prisma.game.update({
        where: { id: gameId },
        data: { timerRunning: false, timerPausedAt: new Date() },
      });
    } else if (action === "resume" && !game.timerRunning) {
      if (game.timerPausedAt) {
        const pausedDuration = Date.now() - game.timerPausedAt.getTime();
        const newStartedAt = new Date(game.startedAt.getTime() + pausedDuration);
        await prisma.game.update({
          where: { id: gameId },
          data: {
            timerRunning: true,
            timerPausedAt: null,
            startedAt: newStartedAt,
          },
        });
      } else {
        await prisma.game.update({
          where: { id: gameId },
          data: { timerRunning: true, timerPausedAt: null },
        });
      }
    }

    return ok({ success: true as const, timerRunning: action === "resume" });
  } catch (error) {
    console.error("Failed to update timer:", error);
    return fail("Failed to update timer");
  }
}
