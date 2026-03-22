import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/rooms/[code]/config — update room configuration (host only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, ...config } = body;

    if (!playerId) {
      return NextResponse.json({ error: "playerId is required" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.hostId !== playerId) {
      return NextResponse.json({ error: "Only the host can change settings" }, { status: 403 });
    }

    if (room.state !== "LOBBY") {
      return NextResponse.json({ error: "Cannot change settings during a game" }, { status: 400 });
    }

    // Build update object from allowed fields
    const updateData: Record<string, unknown> = {};
    if (config.timeLimit !== undefined) updateData.timeLimit = config.timeLimit;
    if (config.spyCount !== undefined) updateData.spyCount = config.spyCount;
    if (config.autoStartTimer !== undefined) updateData.autoStartTimer = config.autoStartTimer;
    if (config.hideSpyCount !== undefined) updateData.hideSpyCount = config.hideSpyCount;
    if (config.moderatorMode !== undefined) updateData.moderatorMode = config.moderatorMode;
    if (config.moderatorLocationId !== undefined) updateData.moderatorLocationId = config.moderatorLocationId ?? null;

    const updated = await prisma.room.update({
      where: { id: room.id },
      data: updateData,
    });

    return NextResponse.json({
      timeLimit: updated.timeLimit,
      spyCount: updated.spyCount,
      autoStartTimer: updated.autoStartTimer,
      hideSpyCount: updated.hideSpyCount,
      moderatorMode: updated.moderatorMode,
      moderatorLocationId: updated.moderatorLocationId,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
