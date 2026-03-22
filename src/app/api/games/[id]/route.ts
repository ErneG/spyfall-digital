import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/games/[id]?playerId=xxx — get game state for a specific player
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");

  if (!playerId) {
    return NextResponse.json({ error: "playerId is required" }, { status: 400 });
  }

  const game = await prisma.game.findUnique({
    where: { id },
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
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const myAssignment = game.assignments.find((a) => a.playerId === playerId);
  if (!myAssignment) {
    return NextResponse.json({ error: "Player not in this game" }, { status: 403 });
  }

  // Get all locations for the location list (shown to all players)
  const allLocations = await prisma.location.findMany({
    select: { id: true, name: true, imageUrl: true },
    orderBy: { name: "asc" },
  });

  // Calculate time remaining
  const elapsed = Math.floor((Date.now() - game.startedAt.getTime()) / 1000);
  const timeRemaining = Math.max(0, game.room.timeLimit - elapsed);

  return NextResponse.json({
    gameId: game.id,
    phase: game.state,
    myRole: myAssignment.role,
    isSpy: myAssignment.isSpy,
    location: myAssignment.isSpy ? null : game.location.name,
    allLocations,
    players: game.room.players,
    timeRemaining,
    timeLimit: game.room.timeLimit,
    startedAt: game.startedAt,
    votes: game.state === "REVEAL"
      ? game.votes.map((v) => ({ voterId: v.voterId, suspectId: v.suspectId }))
      : undefined,
    // Only reveal spies after game ends
    spies: game.state === "REVEAL" || game.state === "FINISHED"
      ? game.assignments.filter((a) => a.isSpy).map((a) => a.playerId)
      : undefined,
    revealedLocation: game.state === "REVEAL" || game.state === "FINISHED"
      ? game.location.name
      : undefined,
  });
}
