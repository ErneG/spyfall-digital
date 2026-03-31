"use server";

import { endGameInput, restartGameInput } from "@/domains/game/schema";
import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

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

    if (!game) {
      return fail("Game not found");
    }

    if (game.state !== "PLAYING" && game.state !== "VOTING") {
      return fail("Game is not active");
    }

    const assignment = game.assignments.find((a) => a.playerId === playerId);
    if (!assignment) {
      return fail("Player not in this game");
    }

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

    if (!game) {
      return fail("Game not found");
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

    return ok({ success: true as const });
  } catch (error) {
    console.error("Failed to restart:", error);
    return fail("Failed to restart");
  }
}
