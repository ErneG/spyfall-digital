"use server";

import { assignRoles, MIN_PLAYERS } from "@/domains/game/logic";
import { startGameInput, type StartGameOutput } from "@/domains/game/schema";
import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

import { buildCandidates, pickLocation, type LocationCandidate } from "./helpers";

type RoomWithRelations = {
  id: string;
  hostId: string;
  moderatorMode: boolean;
  moderatorLocationId: string | null;
  prevLocationId: string | null;
  autoStartTimer: boolean;
  spyCount: number;
  players: Array<{ id: string; moderatorRole: string | null }>;
  selectedLocations: Array<{ locationId: string }>;
  customLocations: Array<{
    id: string;
    name: string;
    allSpies: boolean;
    roles: Array<{ name: string }>;
  }>;
};

function buildAssignments(
  room: RoomWithRelations,
  chosen: LocationCandidate,
): Array<{ playerId: string; role: string; isSpy: boolean }> {
  const playerIds = room.players.map((p) => p.id);

  if (chosen.isAllSpies) {
    return playerIds.map((pid) => ({ playerId: pid, role: "SPY", isSpy: true }));
  }

  const moderatorAssignments = room.moderatorMode
    ? room.players
        .filter((p) => p.moderatorRole)
        .map((p) => ({ playerId: p.id, role: p.moderatorRole ?? "SPY" }))
    : [];

  return assignRoles(playerIds, chosen.roles, room.spyCount, moderatorAssignments);
}

/** Start a new game round in a room (host only). */
export async function startGame(input: unknown): Promise<ActionResult<StartGameOutput>> {
  const parsed = startGameInput.safeParse(input);
  if (!parsed.success) {return fail("roomId and playerId are required");}

  const { roomId, playerId } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        players: true,
        selectedLocations: { select: { locationId: true } },
        customLocations: { where: { selected: true }, include: { roles: true } },
      },
    });

    if (!room) {return fail("Room not found");}
    if (room.hostId !== playerId) {return fail("Only the host can start");}
    if (room.players.length < MIN_PLAYERS) {return fail(`Need at least ${MIN_PLAYERS} players`);}

    const candidates = await buildCandidates(
      room.selectedLocations.map((sl) => sl.locationId),
      room.customLocations,
    );
    if (candidates.length === 0) {return fail("No locations selected");}

    const chosen = pickLocation(
      candidates,
      room.moderatorMode,
      room.moderatorLocationId,
      room.prevLocationId,
    );
    const assignments = buildAssignments(room, chosen);

    const game = await prisma.$transaction(async (tx) => {
      const newGame = await tx.game.create({
        data: {
          roomId: room.id,
          locationId: chosen.type === "builtin" ? chosen.id : null,
          locationName: chosen.name,
          state: "PLAYING",
          timerRunning: room.autoStartTimer,
          assignments: {
            create: assignments.map((a) => ({
              playerId: a.playerId,
              role: a.role,
              isSpy: a.isSpy,
            })),
          },
        },
      });
      await tx.room.update({
        where: { id: room.id },
        data: { state: "PLAYING", prevLocationId: chosen.id },
      });
      if (room.moderatorMode) {
        await tx.player.updateMany({ where: { roomId: room.id }, data: { moderatorRole: null } });
      }
      return newGame;
    });

    return ok({
      gameId: game.id,
      state: game.state,
      startedAt: game.startedAt.toISOString(),
      timerRunning: game.timerRunning,
    });
  } catch (error) {
    console.error("Failed to start game:", error);
    return fail("Failed to start game");
  }
}
