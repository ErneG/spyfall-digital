import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rooms/[code]/locations — get all locations with selection state
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      selectedLocations: { select: { locationId: true } },
      customLocations: {
        include: { roles: { select: { id: true, name: true } } },
      },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const allLocations = await prisma.location.findMany({
    select: { id: true, name: true, edition: true },
    orderBy: { name: "asc" },
  });

  const selectedIds = new Set(room.selectedLocations.map((sl) => sl.locationId));

  return NextResponse.json({
    locations: allLocations.map((loc) => ({
      ...loc,
      selected: selectedIds.has(loc.id),
    })),
    customLocations: room.customLocations.map((cl) => ({
      id: cl.id,
      name: cl.name,
      allSpies: cl.allSpies,
      selected: cl.selected,
      roles: cl.roles,
    })),
  });
}

// PUT /api/rooms/[code]/locations — update location selection
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, locationIds } = body;

    if (!playerId || !Array.isArray(locationIds)) {
      return NextResponse.json({ error: "playerId and locationIds[] required" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.hostId !== playerId) return NextResponse.json({ error: "Host only" }, { status: 403 });
    if (room.state !== "LOBBY") return NextResponse.json({ error: "Game in progress" }, { status: 400 });

    // Replace all selections
    await prisma.$transaction([
      prisma.roomLocation.deleteMany({ where: { roomId: room.id } }),
      prisma.roomLocation.createMany({
        data: locationIds.map((locationId: string) => ({ roomId: room.id, locationId })),
      }),
    ]);

    return NextResponse.json({ success: true, count: locationIds.length });
  } catch {
    return NextResponse.json({ error: "Failed to update locations" }, { status: 500 });
  }
}
