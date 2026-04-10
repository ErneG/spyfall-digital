"use server";

import {
  resolveBuiltInContentSourceLocations,
  type CollectionContentSourceInput,
  type ContentSourceInput,
} from "@/entities/library/content-source";
import { getAuthUser } from "@/shared/lib/auth-session";
import { prisma } from "@/shared/lib/prisma";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

interface ApplyRoomContentSourceInput {
  playerId: string;
  roomCode: string;
  source: ContentSourceInput;
}

interface RoomSourceMutationResult {
  selectedLocationCount: number;
  sourceKind: ContentSourceInput["kind"];
}

async function resolveCollectionLocations(source: CollectionContentSourceInput) {
  const user = await getAuthUser();
  if (!user) {
    return {
      error: "Sign in to use saved collections",
      success: false as const,
    };
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
    return {
      error: "Collection not found",
      success: false as const,
    };
  }

  if (collection.locations.length === 0) {
    return {
      error: "Selected collection has no locations",
      success: false as const,
    };
  }

  return {
    locations: collection.locations.map((location) => ({
      allSpies: location.allSpies,
      name: location.name,
      roles: location.roles.map((role) => role.name),
    })),
    success: true as const,
  };
}

export async function applyRoomContentSource(
  input: ApplyRoomContentSourceInput,
): Promise<ActionResult<RoomSourceMutationResult>> {
  const roomCode = input.roomCode.toUpperCase();

  try {
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
    });

    if (!room) {
      return fail("Room not found");
    }

    if (room.hostId !== input.playerId) {
      return fail("Only the host can change the room source");
    }

    if (room.state !== "LOBBY") {
      return fail("Cannot change the room source during a game");
    }

    if (input.source.kind === "collection") {
      const collectionSource = await resolveCollectionLocations(input.source);
      if (!collectionSource.success) {
        return fail(collectionSource.error);
      }

      await prisma.$transaction(async (tx) => {
        await tx.roomLocation.deleteMany({
          where: { roomId: room.id },
        });
        await tx.customLocation.deleteMany({
          where: { roomId: room.id },
        });

        for (const location of collectionSource.locations) {
          await tx.customLocation.create({
            data: {
              roomId: room.id,
              name: location.name,
              allSpies: location.allSpies,
              selected: true,
              roles: {
                create: location.roles.map((roleName) => ({ name: roleName })),
              },
            },
          });
        }
      });

      return ok({
        selectedLocationCount: collectionSource.locations.length,
        sourceKind: "collection",
      });
    }

    const builtInLocationNames = resolveBuiltInContentSourceLocations(input.source.categories).map(
      (location) => location.name,
    );

    const builtInLocations = await prisma.location.findMany({
      where: { name: { in: builtInLocationNames } },
      select: { id: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.roomLocation.deleteMany({
        where: { roomId: room.id },
      });
      await tx.customLocation.deleteMany({
        where: { roomId: room.id },
      });
      await tx.roomLocation.createMany({
        data: builtInLocations.map((location) => ({
          roomId: room.id,
          locationId: location.id,
        })),
      });
    });

    return ok({
      selectedLocationCount: builtInLocations.length,
      sourceKind: "built-in",
    });
  } catch (error) {
    console.error("applyRoomContentSource failed:", error);
    return fail("Failed to update the room source");
  }
}
