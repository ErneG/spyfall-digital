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

  // Get all locations for the location list
  const allLocations = await prisma.location.findMany({
    select: { id: true, name: true, imageUrl: true },
    orderBy: { name: "asc" },
  });

  // Also include selected custom locations
  const customLocations = await prisma.customLocation.findMany({
    where: { roomId: game.roomId, selected: true, allSpies: false },
    select: { id: true, name: true },
  });

  const combinedLocations = [
    ...allLocations.map((l) => ({ ...l, edition: undefined })),
    ...customLocations.map((cl) => ({ id: cl.id, name: cl.name, imageUrl: null })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  // Calculate time remaining
  let timeRemaining: number;
  if (!game.timerRunning && game.timerPausedAt) {
    const elapsedBeforePause = Math.floor(
      (game.timerPausedAt.getTime() - game.startedAt.getTime()) / 1000,
    );
    timeRemaining = Math.max(0, game.room.timeLimit - elapsedBeforePause);
  } else {
    const elapsed = Math.floor((Date.now() - game.startedAt.getTime()) / 1000);
    timeRemaining = Math.max(0, game.room.timeLimit - elapsed);
  }

  // Get previous location name
  const prevLocation = game.room.prevLocationId
    ? await prisma.location.findUnique({
        where: { id: game.room.prevLocationId },
        select: { name: true },
      })
    : null;

  return NextResponse.json({
    gameId: game.id,
    phase: game.state,
    myRole: myAssignment.role,
    isSpy: myAssignment.isSpy,
    location: myAssignment.isSpy ? null : game.locationName,
    allLocations: combinedLocations,
    players: game.room.players,
    timeRemaining,
    timeLimit: game.room.timeLimit,
    startedAt: game.startedAt,
    timerRunning: game.timerRunning,
    hideSpyCount: game.room.hideSpyCount,
    spyCount: game.room.spyCount,
    prevLocationName: prevLocation?.name ?? null,
    votes:
      game.state === "REVEAL" || game.state === "FINISHED"
        ? game.votes.map((v) => ({ voterId: v.voterId, suspectId: v.suspectId }))
        : undefined,
    spies:
      game.state === "REVEAL" || game.state === "FINISHED"
        ? game.assignments.filter((a) => a.isSpy).map((a) => a.playerId)
        : undefined,
    revealedLocation:
      game.state === "REVEAL" || game.state === "FINISHED"
        ? game.locationName
        : undefined,
  });
}
