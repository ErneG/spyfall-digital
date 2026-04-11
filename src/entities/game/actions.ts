"use server";

import { prisma } from "@/shared/lib/prisma";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

import {
  REVEAL_STATES,
  buildCandidates,
  calculateTimeRemaining,
  fetchCombinedLocations,
  type LocationCandidate,
  pickLocation,
} from "./action-helpers";
import { MIN_PLAYERS, assignRoles } from "./logic";
import {
  castVoteInput,
  endGameInput,
  type GameView,
  restartGameInput,
  startGameInput,
  type StartGameOutput,
  timerToggleInput,
} from "./schema";

const GAME_NOT_FOUND_ERROR = "Game not found";

type RoomWithRelations = {
  id: string;
  hostId: string;
  moderatorMode: boolean;
  moderatorLocationId: string | null;
  prevLocationId: string | null;
  autoStartTimer: boolean;
  spyCount: number;
  players: Array<{ id: string; moderatorRole: string | null }>;
  selectedLocations: Array<{ locationId: string }>;
  customLocations: Array<{
    id: string;
    name: string;
    allSpies: boolean;
    roles: Array<{ name: string }>;
  }>;
};

function buildAssignments(
  room: RoomWithRelations,
  chosen: LocationCandidate,
): Array<{ playerId: string; role: string; isSpy: boolean }> {
  const playerIds = room.players.map((player) => player.id);

  if (chosen.isAllSpies) {
    return playerIds.map((playerId) => ({ playerId, role: "SPY", isSpy: true }));
  }

  const moderatorAssignments = room.moderatorMode
    ? room.players
        .filter((player) => player.moderatorRole)
        .map((player) => ({ playerId: player.id, role: player.moderatorRole ?? "SPY" }))
    : [];

  return assignRoles(playerIds, chosen.roles, room.spyCount, moderatorAssignments);
}

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

    if (!game) {
      return fail(GAME_NOT_FOUND_ERROR);
    }

    const myAssignment = game.assignments.find((assignment) => assignment.playerId === playerId);
    if (!myAssignment) {
      return fail("Player not in this game");
    }

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
        ? game.votes.map((vote) => ({ voterId: vote.voterId, suspectId: vote.suspectId }))
        : undefined,
      spies: isRevealPhase
        ? game.assignments
            .filter((assignment) => assignment.isSpy)
            .map((assignment) => assignment.playerId)
        : undefined,
      revealedLocation: isRevealPhase ? game.locationName : undefined,
    });
  } catch (error) {
    console.error("Failed to get game state:", error);
    return fail("Failed to get game state");
  }
}

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
        customLocations: { where: { selected: true }, include: { roles: true } },
      },
    });

    if (!room) {
      return fail("Room not found");
    }
    if (room.hostId !== playerId) {
      return fail("Only the host can start");
    }
    if (room.players.length < MIN_PLAYERS) {
      return fail(`Need at least ${MIN_PLAYERS} players`);
    }

    const candidates = await buildCandidates(
      room.selectedLocations.map((selectedLocation) => selectedLocation.locationId),
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
    const assignments = buildAssignments(room, chosen);

    const game = await prisma.$transaction(async (transaction) => {
      const createdGame = await transaction.game.create({
        data: {
          roomId: room.id,
          locationId: chosen.type === "builtin" ? chosen.id : null,
          locationName: chosen.name,
          state: "PLAYING",
          timerRunning: room.autoStartTimer,
          assignments: {
            create: assignments.map((assignment) => ({
              playerId: assignment.playerId,
              role: assignment.role,
              isSpy: assignment.isSpy,
            })),
          },
        },
      });

      await transaction.room.update({
        where: { id: room.id },
        data: { state: "PLAYING", prevLocationId: chosen.id },
      });

      if (room.moderatorMode) {
        await transaction.player.updateMany({
          where: { roomId: room.id },
          data: { moderatorRole: null },
        });
      }

      return createdGame;
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

    if (!game) {
      return fail(GAME_NOT_FOUND_ERROR);
    }

    if (game.state !== "PLAYING" && game.state !== "VOTING") {
      return fail("Game is not active");
    }

    const assignment = game.assignments.find((item) => item.playerId === playerId);
    if (!assignment) {
      return fail("Player not in this game");
    }

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

    if (!game) {
      return fail(GAME_NOT_FOUND_ERROR);
    }
    if (game.room.hostId !== playerId) {
      return fail("Only the host can restart");
    }

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

    return ok({ success: true });
  } catch (error) {
    console.error("Failed to restart:", error);
    return fail("Failed to restart");
  }
}

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

    if (!game) {
      return fail(GAME_NOT_FOUND_ERROR);
    }
    if (game.state !== "PLAYING" && game.state !== "VOTING") {
      return fail("Voting is not allowed in this phase");
    }
    if (voterId === suspectId) {
      return fail("Cannot vote for yourself");
    }

    const playerIds = new Set(game.room.players.map((player) => player.id));
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

    return ok({ success: true, votesIn: totalVotes, totalPlayers });
  } catch (error) {
    console.error("Failed to cast vote:", error);
    return fail("Failed to cast vote");
  }
}

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

    if (!game) {
      return fail(GAME_NOT_FOUND_ERROR);
    }
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

    return ok({ success: true, timerRunning: action === "resume" });
  } catch (error) {
    console.error("Failed to update timer:", error);
    return fail("Failed to update timer");
  }
}

export type { StartGameOutput } from "./schema";
