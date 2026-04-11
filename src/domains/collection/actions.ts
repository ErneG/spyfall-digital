"use server";

export {
  addLocationToCollection,
  createCollection,
  deleteCollection,
  getCollection,
  getCollections,
  getSavedLocationImports,
  importSavedLocationToCollection,
  removeLocationFromCollection,
  updateCollection,
  updateCollectionLocation,
} from "@/entities/library/actions";

import { getAuthUser } from "@/shared/lib/auth-session";
import { prisma } from "@/shared/lib/prisma";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

import { importCollectionInput, type ImportCollectionInput } from "./schema";

const NOT_AUTHENTICATED_ERROR = "Not authenticated";

export async function importCollectionToRoom(
  input: ImportCollectionInput,
): Promise<ActionResult<{ imported: number }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  const parsed = importCollectionInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const room = await prisma.room.findUnique({
      where: { code: parsed.data.roomCode.toUpperCase() },
    });
    if (!room) {
      return fail("Room not found");
    }
    if (room.hostId !== parsed.data.playerId) {
      return fail("Only the host can import collections");
    }

    const collection = await prisma.locationCollection.findFirst({
      where: { id: parsed.data.collectionId, userId: user.id },
      include: {
        locations: { include: { roles: true } },
      },
    });
    if (!collection) {
      return fail("Collection not found");
    }

    let imported = 0;
    for (const location of collection.locations) {
      await prisma.customLocation.create({
        data: {
          roomId: room.id,
          name: location.name,
          allSpies: location.allSpies,
          selected: true,
          roles: {
            create: location.roles.map((role) => ({ name: role.name })),
          },
        },
      });
      imported += 1;
    }

    return ok({ imported });
  } catch (error) {
    console.error("importCollectionToRoom failed:", error);
    return fail("Failed to import collection");
  }
}
