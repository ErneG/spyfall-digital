"use server";

import { timerToggleInput } from "@/domains/game/schema";
import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

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

    if (!game) {
      return fail("Game not found");
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

    return ok({ success: true as const, timerRunning: action === "resume" });
  } catch (error) {
    console.error("Failed to update timer:", error);
    return fail("Failed to update timer");
  }
}
