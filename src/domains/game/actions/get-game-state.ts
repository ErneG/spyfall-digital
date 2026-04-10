"use server";

import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

import { calculateTimeRemaining, fetchCombinedLocations, REVEAL_STATES } from "./helpers";

import type { GameView } from "@/domains/game/schema";

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

    if (!game) {
      return fail("Game not found");
    }

    const myAssignment = game.assignments.find((a) => a.playerId === playerId);
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
