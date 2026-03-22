import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { generateRoomCode } from "@/shared/lib/room-code";
import { DEFAULT_TIME_LIMIT } from "@/shared/lib/constants";

// POST /api/rooms — create a new room
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hostName, timeLimit, spyCount } = body;

    if (!hostName || typeof hostName !== "string" || hostName.trim().length === 0) {
      return NextResponse.json({ error: "Host name is required" }, { status: 400 });
    }

    // Generate unique room code
    let code = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      code = generateRoomCode();
      const existing = await prisma.room.findUnique({ where: { code } });
      if (!existing) break;
      if (attempt === 9) {
        return NextResponse.json({ error: "Failed to generate unique room code" }, { status: 500 });
      }
    }

    // Get all locations to auto-select them
    const allLocations = await prisma.location.findMany({ select: { id: true } });

    const room = await prisma.room.create({
      data: {
        code,
        timeLimit: timeLimit ?? DEFAULT_TIME_LIMIT,
        spyCount: spyCount ?? 1,
        hostId: "",
        players: {
          create: { name: hostName.trim(), isHost: true },
        },
        // Select all locations by default
        selectedLocations: {
          create: allLocations.map((loc) => ({ locationId: loc.id })),
        },
      },
      include: { players: true },
    });

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
