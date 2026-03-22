import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

// POST /api/games/[id]/timer — pause/resume timer (host only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { playerId, action } = body; // action: "pause" | "resume"

    if (!playerId || !action) {
      return NextResponse.json({ error: "playerId and action required" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    if (game.room.hostId !== playerId) {
      return NextResponse.json({ error: "Only the host can control the timer" }, { status: 403 });
    }

    if (action === "pause" && game.timerRunning) {
      await prisma.game.update({
        where: { id },
        data: { timerRunning: false, timerPausedAt: new Date() },
      });
    } else if (action === "resume" && !game.timerRunning) {
      // Adjust startedAt to account for paused time
      if (game.timerPausedAt) {
        const pausedDuration = Date.now() - game.timerPausedAt.getTime();
        const newStartedAt = new Date(game.startedAt.getTime() + pausedDuration);
        await prisma.game.update({
          where: { id },
          data: { timerRunning: true, timerPausedAt: null, startedAt: newStartedAt },
        });
      } else {
        await prisma.game.update({
          where: { id },
          data: { timerRunning: true, timerPausedAt: null },
        });
      }
    }

    return NextResponse.json({ success: true, timerRunning: action === "resume" });
  } catch {
    return NextResponse.json({ error: "Failed to update timer" }, { status: 500 });
  }
}
