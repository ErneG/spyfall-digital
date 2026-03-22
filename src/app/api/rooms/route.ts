import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRoomCode, MIN_PLAYERS, MAX_PLAYERS, DEFAULT_TIME_LIMIT } from "@/lib/game-logic";

// POST /api/rooms — create a new room
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hostName, timeLimit, spyCount } = body;

    if (!hostName || typeof hostName !== "string" || hostName.trim().length === 0) {
      return NextResponse.json({ error: "Host name is required" }, { status: 400 });
    }

    // Generate unique room code (retry if collision)
    let code: string;
    let attempts = 0;
    do {
      code = generateRoomCode();
      const existing = await prisma.room.findUnique({ where: { code } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json({ error: "Failed to generate unique room code" }, { status: 500 });
    }

    const room = await prisma.room.create({
      data: {
        code,
        timeLimit: timeLimit ?? DEFAULT_TIME_LIMIT,
        spyCount: spyCount ?? 1,
        hostId: "", // will be set after host player is created
        players: {
          create: {
            name: hostName.trim(),
            isHost: true,
          },
        },
      },
      include: { players: true },
    });

    // Update hostId to the created player
    const host = room.players[0];
    await prisma.room.update({
      where: { id: room.id },
      data: { hostId: host.id },
    });

    return NextResponse.json({
      roomId: room.id,
      code: room.code,
      playerId: host.id,
      timeLimit: room.timeLimit,
      spyCount: room.spyCount,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
