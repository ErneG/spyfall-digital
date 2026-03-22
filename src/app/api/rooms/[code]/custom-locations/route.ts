import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

const ROOM_NOT_FOUND = "Room not found";
const HOST_ONLY = "Host only";

// POST /api/rooms/[code]/custom-locations — create a custom location
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, name, roles, allSpies } = body;

    if (!playerId) return NextResponse.json({ error: "playerId required" }, { status: 400 });

    const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
    if (!room) return NextResponse.json({ error: ROOM_NOT_FOUND }, { status: 404 });
    if (room.hostId !== playerId) return NextResponse.json({ error: HOST_ONLY }, { status: 403 });

    const customLocation = await prisma.customLocation.create({
      data: {
        roomId: room.id,
        name: name ?? "New Location",
        allSpies: allSpies ?? false,
        roles: {
          create: (roles ?? []).map((r: string) => ({ name: r })),
        },
      },
      include: { roles: true },
    });

    return NextResponse.json({
      id: customLocation.id,
      name: customLocation.name,
      allSpies: customLocation.allSpies,
      selected: customLocation.selected,
      roles: customLocation.roles.map((r) => ({ id: r.id, name: r.name })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to create custom location" }, { status: 500 });
  }
}

// PATCH /api/rooms/[code]/custom-locations — update a custom location
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, locationId, name, roles, allSpies, selected } = body;

    if (!playerId || !locationId) {
      return NextResponse.json({ error: "playerId and locationId required" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
    if (!room) return NextResponse.json({ error: ROOM_NOT_FOUND }, { status: 404 });
    if (room.hostId !== playerId) return NextResponse.json({ error: HOST_ONLY }, { status: 403 });

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (allSpies !== undefined) updateData.allSpies = allSpies;
    if (selected !== undefined) updateData.selected = selected;

    await prisma.$transaction(async (tx) => {
      await tx.customLocation.update({
        where: { id: locationId },
        data: updateData,
      });

      if (roles !== undefined) {
        await tx.customLocationRole.deleteMany({ where: { customLocationId: locationId } });
        await tx.customLocationRole.createMany({
          data: roles.map((r: string) => ({ customLocationId: locationId, name: r })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update custom location" }, { status: 500 });
  }
}

// DELETE /api/rooms/[code]/custom-locations — delete a custom location
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, locationId } = body;

    if (!playerId || !locationId) {
      return NextResponse.json({ error: "playerId and locationId required" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
    if (!room) return NextResponse.json({ error: ROOM_NOT_FOUND }, { status: 404 });
    if (room.hostId !== playerId) return NextResponse.json({ error: HOST_ONLY }, { status: 403 });

    await prisma.customLocation.delete({ where: { id: locationId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete custom location" }, { status: 500 });
  }
}
