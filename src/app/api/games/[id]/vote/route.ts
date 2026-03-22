import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/games/[id]/vote — cast a vote against a suspect
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { voterId, suspectId } = body;

    if (!voterId || !suspectId) {
      return NextResponse.json({ error: "voterId and suspectId are required" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        assignments: true,
        room: { include: { players: true } },
        votes: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.state !== "PLAYING" && game.state !== "VOTING") {
      return NextResponse.json({ error: "Voting is not allowed in this phase" }, { status: 400 });
    }

    // Can't vote for yourself
    if (voterId === suspectId) {
      return NextResponse.json({ error: "Cannot vote for yourself" }, { status: 400 });
    }

    // Check both players are in the game
    const playerIds = game.room.players.map((p) => p.id);
    if (!playerIds.includes(voterId) || !playerIds.includes(suspectId)) {
      return NextResponse.json({ error: "Invalid player" }, { status: 400 });
    }

    // Upsert vote (one vote per player per game)
    await prisma.vote.upsert({
      where: { gameId_voterId: { gameId: id, voterId } },
      update: { suspectId },
      create: { gameId: id, voterId, suspectId },
    });

    // Check if all players have voted
    const totalVotes = await prisma.vote.count({ where: { gameId: id } });
    const totalPlayers = game.room.players.length;

    if (totalVotes >= totalPlayers) {
      // All votes in — transition to REVEAL
      await prisma.$transaction([
        prisma.game.update({ where: { id }, data: { state: "REVEAL", endedAt: new Date() } }),
        prisma.room.update({ where: { id: game.roomId }, data: { state: "REVEAL" } }),
      ]);
    } else if (game.state !== "VOTING") {
      // Transition to VOTING once first vote is cast
      await prisma.$transaction([
        prisma.game.update({ where: { id }, data: { state: "VOTING" } }),
        prisma.room.update({ where: { id: game.roomId }, data: { state: "VOTING" } }),
      ]);
    }

    return NextResponse.json({ success: true, votesIn: totalVotes, totalPlayers });
  } catch {
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
