import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/games/[id]/restart — return room to lobby for a new round
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { playerId } = body;

    const game = await prisma.game.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.room.hostId !== playerId) {
      return NextResponse.json({ error: "Only the host can restart" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.game.update({
        where: { id },
        data: { state: "FINISHED" },
      }),
      prisma.room.update({
        where: { id: game.roomId },
        data: { state: "LOBBY" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to restart" }, { status: 500 });
  }
}
