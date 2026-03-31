"use server";

import { castVoteInput } from "@/domains/game/schema";
import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

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

    if (!game) {
      return fail("Game not found");
    }

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
