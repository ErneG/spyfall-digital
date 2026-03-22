import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignRoles, MIN_PLAYERS, shuffle } from "@/lib/game-logic";

// POST /api/games — start a new game round in a room
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, playerId } = body;

    if (!roomId || !playerId) {
      return NextResponse.json({ error: "roomId and playerId are required" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { players: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.hostId !== playerId) {
      return NextResponse.json({ error: "Only the host can start the game" }, { status: 403 });
    }

    if (room.players.length < MIN_PLAYERS) {
      return NextResponse.json(
        { error: `Need at least ${MIN_PLAYERS} players to start` },
        { status: 400 },
      );
    }

    // Pick a random location
    const locations = await prisma.location.findMany({
      include: { roles: true },
    });

    const location = shuffle(locations)[0];
    const roleNames = location.roles.map((r) => r.name);
    const playerIds = room.players.map((p) => p.id);

    const assignments = assignRoles(playerIds, roleNames, room.spyCount);

    // Create the game and assignments in a transaction
    const game = await prisma.$transaction(async (tx) => {
      const g = await tx.game.create({
        data: {
          roomId: room.id,
          locationId: location.id,
          state: "PLAYING",
          assignments: {
            create: assignments.map((a) => ({
              playerId: a.playerId,
              role: a.role,
              isSpy: a.isSpy,
            })),
          },
        },
        include: {
          assignments: true,
          location: { include: { roles: true } },
        },
      });

      await tx.room.update({
        where: { id: room.id },
        data: { state: "PLAYING" },
      });

      return g;
    });

    return NextResponse.json({
      gameId: game.id,
      state: game.state,
      startedAt: game.startedAt,
    });
  } catch {
    return NextResponse.json({ error: "Failed to start game" }, { status: 500 });
  }
}
