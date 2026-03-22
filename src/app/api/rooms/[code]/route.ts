import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_PLAYERS } from "@/lib/game-logic";

// GET /api/rooms/[code] — get room state
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      players: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, isHost: true, isOnline: true, avatarUrl: true },
      },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: room.id,
    code: room.code,
    state: room.state,
    hostId: room.hostId,
    timeLimit: room.timeLimit,
    spyCount: room.spyCount,
    players: room.players,
  });
}

// POST /api/rooms/[code] — join a room
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerName } = body;

    if (!playerName || typeof playerName !== "string" || playerName.trim().length === 0) {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: { players: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.state !== "LOBBY") {
      return NextResponse.json({ error: "Game already in progress" }, { status: 400 });
    }

    if (room.players.length >= MAX_PLAYERS) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    const player = await prisma.player.create({
      data: {
        name: playerName.trim(),
        roomId: room.id,
      },
    });

    return NextResponse.json({
      playerId: player.id,
      roomId: room.id,
      code: room.code,
    });
  } catch {
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
