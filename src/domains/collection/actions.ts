"use server";

import { getAuthUser } from "@/shared/lib/auth-session";
import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

import {
  createCollectionInput,
  updateCollectionInput,
  addLocationInput,
  updateLocationInput,
  removeLocationInput,
  importCollectionInput,
  type CollectionListItem,
  type CollectionDetail,
  type CreateCollectionInput,
  type UpdateCollectionInput,
  type AddLocationInput,
  type UpdateLocationInput,
  type RemoveLocationInput,
  type ImportCollectionInput,
  type CollectionLocationItem,
} from "./schema";

// ─── getCollections ──────────────────────────────────────────

export async function getCollections(): Promise<ActionResult<CollectionListItem[]>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  try {
    const collections = await prisma.locationCollection.findMany({
      where: { userId: user.id },
      include: { _count: { select: { locations: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return ok(
      collections.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        locationCount: c._count.locations,
        createdAt: c.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("getCollections failed:", error);
    return fail("Failed to load collections");
  }
}

// ─── getCollection ───────────────────────────────────────────

export async function getCollection(id: string): Promise<ActionResult<CollectionDetail>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  try {
    const collection = await prisma.locationCollection.findFirst({
      where: { id, userId: user.id },
      include: {
        locations: {
          include: { roles: true },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!collection) {
      return fail("Collection not found");
    }

    return ok({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      locations: collection.locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        allSpies: loc.allSpies,
        roles: loc.roles.map((r) => ({ id: r.id, name: r.name })),
      })),
    });
  } catch (error) {
    console.error("getCollection failed:", error);
    return fail("Failed to load collection");
  }
}

// ─── createCollection ────────────────────────────────────────

export async function createCollection(
  input: CreateCollectionInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  const parsed = createCollectionInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const collection = await prisma.locationCollection.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    });

    return ok({ id: collection.id });
  } catch (error) {
    console.error("createCollection failed:", error);
    return fail("Failed to create collection");
  }
}

// ─── updateCollection ────────────────────────────────────────

export async function updateCollection(
  input: UpdateCollectionInput,
): Promise<ActionResult<{ updated: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  const parsed = updateCollectionInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const existing = await prisma.locationCollection.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });
    if (!existing) {
      return fail("Collection not found");
    }

    await prisma.locationCollection.update({
      where: { id: parsed.data.id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      },
    });

    return ok({ updated: true });
  } catch (error) {
    console.error("updateCollection failed:", error);
    return fail("Failed to update collection");
  }
}

// ─── deleteCollection ────────────────────────────────────────

export async function deleteCollection(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  try {
    const existing = await prisma.locationCollection.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return fail("Collection not found");
    }

    await prisma.locationCollection.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    console.error("deleteCollection failed:", error);
    return fail("Failed to delete collection");
  }
}

// ─── addLocationToCollection ─────────────────────────────────

export async function addLocationToCollection(
  input: AddLocationInput,
): Promise<ActionResult<CollectionLocationItem>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  const parsed = addLocationInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const collection = await prisma.locationCollection.findFirst({
      where: { id: parsed.data.collectionId, userId: user.id },
    });
    if (!collection) {
      return fail("Collection not found");
    }

    const location = await prisma.collectionLocation.create({
      data: {
        collectionId: parsed.data.collectionId,
        name: parsed.data.name,
        allSpies: parsed.data.allSpies ?? false,
        roles: {
          create: parsed.data.roles.map((name) => ({ name })),
        },
      },
      include: { roles: true },
    });

    return ok({
      id: location.id,
      name: location.name,
      allSpies: location.allSpies,
      roles: location.roles.map((r) => ({ id: r.id, name: r.name })),
    });
  } catch (error) {
    console.error("addLocationToCollection failed:", error);
    return fail("Failed to add location");
  }
}

// ─── updateCollectionLocation ────────────────────────────────

export async function updateCollectionLocation(
  input: UpdateLocationInput,
): Promise<ActionResult<{ updated: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  const parsed = updateLocationInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    // Verify ownership through collection
    const location = await prisma.collectionLocation.findFirst({
      where: { id: parsed.data.locationId },
      include: { collection: { select: { userId: true } } },
    });
    if (!location || location.collection.userId !== user.id) {
      return fail("Location not found");
    }

    await prisma.collectionLocation.update({
      where: { id: parsed.data.locationId },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.allSpies !== undefined && { allSpies: parsed.data.allSpies }),
      },
    });

    return ok({ updated: true });
  } catch (error) {
    console.error("updateCollectionLocation failed:", error);
    return fail("Failed to update location");
  }
}

// ─── removeLocationFromCollection ────────────────────────────

export async function removeLocationFromCollection(
  input: RemoveLocationInput,
): Promise<ActionResult<{ deleted: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  const parsed = removeLocationInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const location = await prisma.collectionLocation.findFirst({
      where: { id: parsed.data.locationId },
      include: { collection: { select: { userId: true } } },
    });
    if (!location || location.collection.userId !== user.id) {
      return fail("Location not found");
    }

    await prisma.collectionLocation.delete({ where: { id: parsed.data.locationId } });
    return ok({ deleted: true });
  } catch (error) {
    console.error("removeLocationFromCollection failed:", error);
    return fail("Failed to remove location");
  }
}

// ─── importCollectionToRoom ──────────────────────────────────
// Copies collection locations into room's CustomLocation records

export async function importCollectionToRoom(
  input: ImportCollectionInput,
): Promise<ActionResult<{ imported: number }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  const parsed = importCollectionInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    // Verify room and host
    const room = await prisma.room.findUnique({
      where: { code: parsed.data.roomCode.toUpperCase() },
    });
    if (!room) {
      return fail("Room not found");
    }
    if (room.hostId !== parsed.data.playerId) {
      return fail("Only the host can import collections");
    }

    // Fetch collection with locations + roles
    const collection = await prisma.locationCollection.findFirst({
      where: { id: parsed.data.collectionId, userId: user.id },
      include: {
        locations: { include: { roles: true } },
      },
    });
    if (!collection) {
      return fail("Collection not found");
    }

    // Copy each collection location as a CustomLocation on the room
    let imported = 0;
    for (const loc of collection.locations) {
      await prisma.customLocation.create({
        data: {
          roomId: room.id,
          name: loc.name,
          allSpies: loc.allSpies,
          selected: true,
          roles: {
            create: loc.roles.map((r) => ({ name: r.name })),
          },
        },
      });
      imported++;
    }

    return ok({ imported });
  } catch (error) {
    console.error("importCollectionToRoom failed:", error);
    return fail("Failed to import collection");
  }
}
