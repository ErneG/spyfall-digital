import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/games/[id]/end — end the game (host only, or spy guessing location)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { playerId, spyGuessLocationId } = body;

    if (!playerId) {
      return NextResponse.json({ error: "playerId is required" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        room: true,
        assignments: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.state !== "PLAYING" && game.state !== "VOTING") {
      return NextResponse.json({ error: "Game is not active" }, { status: 400 });
    }

    const assignment = game.assignments.find((a) => a.playerId === playerId);
    if (!assignment) {
      return NextResponse.json({ error: "Player not in this game" }, { status: 403 });
    }

    // Spy guessing location
    if (spyGuessLocationId && assignment.isSpy) {
      const isCorrectGuess = spyGuessLocationId === game.locationId;
      await prisma.$transaction([
        prisma.game.update({
          where: { id },
          data: { state: "REVEAL", endedAt: new Date() },
        }),
        prisma.room.update({
          where: { id: game.roomId },
          data: { state: "REVEAL" },
        }),
      ]);

      return NextResponse.json({
        ended: true,
        spyGuessedCorrectly: isCorrectGuess,
        spyWins: isCorrectGuess,
      });
    }

    // Host ending the game
    if (game.room.hostId === playerId) {
      await prisma.$transaction([
        prisma.game.update({
          where: { id },
          data: { state: "REVEAL", endedAt: new Date() },
        }),
        prisma.room.update({
          where: { id: game.roomId },
          data: { state: "REVEAL" },
        }),
      ]);

      return NextResponse.json({ ended: true });
    }

    return NextResponse.json({ error: "Not authorized to end the game" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Failed to end game" }, { status: 500 });
  }
}
