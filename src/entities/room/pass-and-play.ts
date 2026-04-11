"use server";

import {
  type CollectionContentSourceInput,
  type ContentSourceInput,
  resolveBuiltInContentSourceLocations,
  resolveCollectionContentSourceLocations,
} from "@/entities/library/content-source";
import { generateUniqueRoomCode } from "@/entities/room/code";
import { getAuthUser } from "@/shared/lib/auth-session";
import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

import type {
  CreatePassAndPlayOutput,
  PassAndPlayPlayersInput,
  PassAndPlaySettingsInput,
  PassAndPlaySourceInput,
} from "./schema";

export interface CreatePassAndPlayRoomInput {
  players: PassAndPlayPlayersInput;
  settings: PassAndPlaySettingsInput;
  source: PassAndPlaySourceInput;
}

async function getCollectionPassAndPlayLocations(
  source: CollectionContentSourceInput,
): Promise<
  | { success: true; customLocations: Array<{ allSpies: boolean; name: string; roles: string[] }> }
  | { success: false; error: string }
> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Sign in to use Library collections" };
  }

  const collection = await prisma.locationCollection.findFirst({
    where: { id: source.collectionId, userId: user.id },
    include: {
      locations: {
        include: { roles: true },
        orderBy: { name: "asc" },
      },
    },
  });
  if (!collection) {
    return { success: false, error: "Collection not found" };
  }
  if (collection.locations.length === 0) {
    return { success: false, error: "Selected collection has no locations" };
  }

  return {
    success: true,
    customLocations: resolveCollectionContentSourceLocations({
      name: collection.name,
      locations: collection.locations.map((location) => ({
        id: location.id,
        name: location.name,
        allSpies: location.allSpies,
        roles: location.roles.map((role) => ({
          id: role.name,
          name: role.name,
        })),
      })),
    }).map((location) => ({
      name: location.name,
      allSpies: location.allSpies,
      roles: location.roles,
    })),
  };
}

function buildPassAndPlayRoomCreateData({
  builtInLocations,
  code,
  collectionLocations,
  playerNames,
  settings,
  source,
}: {
  builtInLocations: Array<{ id: string }>;
  code: string;
  collectionLocations: Array<{ allSpies: boolean; name: string; roles: string[] }>;
  playerNames: string[];
  settings: { hideSpyCount: boolean; spyCount: number; timeLimit: number };
  source: ContentSourceInput;
}) {
  return {
    code,
    timeLimit: settings.timeLimit,
    spyCount: settings.spyCount,
    hideSpyCount: settings.hideSpyCount,
    autoStartTimer: false,
    hostId: "",
    players: {
      create: playerNames.map((name, index) => ({
        name,
        isHost: index === 0,
      })),
    },
    ...(source.kind === "collection"
      ? {
          customLocations: {
            create: collectionLocations.map((location) => ({
              name: location.name,
              allSpies: location.allSpies,
              selected: true,
              roles: {
                create: location.roles.map((roleName) => ({ name: roleName })),
              },
            })),
          },
        }
      : {
          selectedLocations: {
            create: builtInLocations.map((location) => ({
              locationId: location.id,
            })),
          },
        }),
  };
}

async function savePassAndPlayNames(hostId: string, playerNames: string[]) {
  const user = await getAuthUser();
  if (!user) {
    return;
  }

  await prisma.$transaction([
    prisma.player.update({
      where: { id: hostId },
      data: { userId: user.id },
    }),
    ...playerNames.map((name) =>
      prisma.nameHistory.upsert({
        where: { userId_name: { userId: user.id, name } },
        update: { usedAt: new Date() },
        create: { userId: user.id, name },
      }),
    ),
  ]);
}

export async function createPassAndPlayRoom(
  input: CreatePassAndPlayRoomInput,
): Promise<ActionResult<CreatePassAndPlayOutput>> {
  const { players, settings, source } = input;
  const playerNames = players.names;

  try {
    const code = await generateUniqueRoomCode();
    if (!code) {
      return fail("Failed to generate unique room code");
    }

    let collectionLocations: Array<{ allSpies: boolean; name: string; roles: string[] }> = [];
    let builtInLocations: Array<{ id: string }> = [];

    if (source.kind === "collection") {
      const collectionSource = await getCollectionPassAndPlayLocations(source);
      if (!collectionSource.success) {
        return fail(collectionSource.error);
      }
      collectionLocations = collectionSource.customLocations;
    } else {
      const builtInLocationNames = resolveBuiltInContentSourceLocations(source.categories).map(
        (location) => location.name,
      );
      builtInLocations = await prisma.location.findMany({
        where: { name: { in: builtInLocationNames } },
        select: { id: true },
      });
    }

    const room = await prisma.$transaction(async (tx) => {
      const created = await tx.room.create({
        data: buildPassAndPlayRoomCreateData({
          builtInLocations,
          code,
          collectionLocations,
          playerNames,
          settings,
          source,
        }),
        include: { players: { orderBy: { createdAt: "asc" } } },
      });

      const host = created.players[0];
      await tx.room.update({
        where: { id: created.id },
        data: { hostId: host.id },
      });

      return created;
    });

    const host = room.players[0];

    await savePassAndPlayNames(host.id, playerNames).catch(() => {});

    return ok({
      roomId: room.id,
      code: room.code,
      hostPlayerId: host.id,
      players: room.players.map((player) => ({ id: player.id, name: player.name })),
    });
  } catch (error) {
    console.error("createPassAndPlayRoom failed:", error);
    return fail("Failed to create pass-and-play room");
  }
}
