import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

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
    prisma.location.findMany({ select: { id: true, name: true, imageUrl: true }, orderBy: { name: "asc" } }),
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

  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  const myAssignment = game.assignments.find((a) => a.playerId === playerId);
  if (!myAssignment) return NextResponse.json({ error: "Player not in this game" }, { status: 403 });

  const [combinedLocations, previousLocation] = await Promise.all([
    fetchCombinedLocations(game.roomId),
    game.room.prevLocationId
      ? prisma.location.findUnique({ where: { id: game.room.prevLocationId }, select: { name: true } })
      : null,
  ]);

  const timeRemaining = calculateTimeRemaining(
    game.timerRunning, game.timerPausedAt, game.startedAt, game.room.timeLimit,
  );

  const isRevealPhase = REVEAL_STATES.has(game.state);

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
    prevLocationName: previousLocation?.name ?? null,
    votes: isRevealPhase
      ? game.votes.map((v) => ({ voterId: v.voterId, suspectId: v.suspectId }))
      : undefined,
    spies: isRevealPhase
      ? game.assignments.filter((a) => a.isSpy).map((a) => a.playerId)
      : undefined,
    revealedLocation: isRevealPhase ? game.locationName : undefined,
  });
}
