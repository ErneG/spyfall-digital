import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignRoles, MIN_PLAYERS, shuffle } from "@/lib/game-logic";

type LocationCandidate = {
  type: "builtin" | "custom";
  id: string | null;
  name: string;
  roles: string[];
  isAllSpies: boolean;
};

async function buildCandidates(
  selectedLocationIds: string[],
  customLocations: Array<{ id: string; name: string; allSpies: boolean; roles: Array<{ name: string }> }>,
): Promise<LocationCandidate[]> {
  const builtInLocations = selectedLocationIds.length > 0
    ? await prisma.location.findMany({ where: { id: { in: selectedLocationIds } }, include: { roles: true } })
    : [];

  return [
    ...builtInLocations.map((location) => ({
      type: "builtin" as const,
      id: location.id,
      name: location.name,
      roles: location.roles.map((r) => r.name),
      isAllSpies: false,
    })),
    ...customLocations.map((cl) => ({
      type: "custom" as const,
      id: cl.id,
      name: cl.allSpies ? "?????" : cl.name,
      roles: cl.roles.map((r) => r.name),
      isAllSpies: cl.allSpies,
    })),
  ];
}

function pickLocation(
  candidates: LocationCandidate[],
  isModeratorMode: boolean,
  moderatorLocationId: string | null,
  previousLocationId: string | null,
): LocationCandidate {
  if (isModeratorMode && moderatorLocationId) {
    const moderatorChoice = candidates.find((c) => c.id === moderatorLocationId);
    return moderatorChoice ?? shuffle(candidates)[0];
  }

  const filtered = candidates.length > 1 && previousLocationId
    ? candidates.filter((c) => c.id !== previousLocationId)
    : candidates;

  return shuffle(filtered)[0];
}

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
      include: {
        players: true,
        selectedLocations: { select: { locationId: true } },
        customLocations: { where: { selected: true }, include: { roles: true } },
      },
    });

    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.hostId !== playerId) return NextResponse.json({ error: "Only the host can start" }, { status: 403 });
    if (room.players.length < MIN_PLAYERS) {
      return NextResponse.json({ error: `Need at least ${MIN_PLAYERS} players` }, { status: 400 });
    }

    const candidates = await buildCandidates(
      room.selectedLocations.map((sl) => sl.locationId),
      room.customLocations,
    );

    if (candidates.length === 0) {
      return NextResponse.json({ error: "No locations selected" }, { status: 400 });
    }

    const chosen = pickLocation(candidates, room.moderatorMode, room.moderatorLocationId, room.prevLocationId);
    const playerIds = room.players.map((p) => p.id);

    const moderatorAssignments = room.moderatorMode
      ? room.players
          .filter((p) => p.moderatorRole)
          .map((p) => ({ playerId: p.id, role: p.moderatorRole ?? "SPY" }))
      : [];

    const assignments = chosen.isAllSpies
      ? playerIds.map((pid) => ({ playerId: pid, role: "SPY", isSpy: true }))
      : assignRoles(playerIds, chosen.roles, room.spyCount, moderatorAssignments);

    const game = await prisma.$transaction(async (tx) => {
      const newGame = await tx.game.create({
        data: {
          roomId: room.id,
          locationId: chosen.type === "builtin" ? chosen.id : null,
          locationName: chosen.name,
          state: "PLAYING",
          timerRunning: room.autoStartTimer,
          assignments: {
            create: assignments.map((a) => ({ playerId: a.playerId, role: a.role, isSpy: a.isSpy })),
          },
        },
      });

      await tx.room.update({ where: { id: room.id }, data: { state: "PLAYING", prevLocationId: chosen.id } });

      if (room.moderatorMode) {
        await tx.player.updateMany({ where: { roomId: room.id }, data: { moderatorRole: null } });
      }

      return newGame;
    });

    return NextResponse.json({ gameId: game.id, state: game.state, startedAt: game.startedAt, timerRunning: game.timerRunning });
  } catch (error) {
    console.error("Failed to start game:", error);
    return NextResponse.json({ error: "Failed to start game" }, { status: 500 });
  }
}
