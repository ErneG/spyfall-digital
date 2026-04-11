"use server";

import { getAuthUser } from "@/shared/lib/auth-session";
import { prisma } from "@/shared/lib/prisma";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

import {
  addLocationInput,
  type AddLocationInput,
  type CollectionDetail,
  type CollectionListItem,
  type CollectionLocationItem,
  createCollectionInput,
  type CreateCollectionInput,
  importSavedLocationToCollectionInput,
  type ImportSavedLocationToCollectionInput,
  removeLocationInput,
  type RemoveLocationInput,
  type SavedLocationImportItem,
  updateCollectionInput,
  type UpdateCollectionInput,
  updateLocationInput,
  type UpdateLocationInput,
} from "./collection";

const NOT_AUTHENTICATED_ERROR = "Not authenticated";
const COLLECTION_NOT_FOUND_ERROR = "Collection not found";
const INVALID_INPUT_ERROR = "Invalid input";

export async function getCollections(): Promise<ActionResult<CollectionListItem[]>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  try {
    const collections = await prisma.locationCollection.findMany({
      where: { userId: user.id },
      include: { _count: { select: { locations: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return ok(
      collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        locationCount: collection._count.locations,
        createdAt: collection.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("getCollections failed:", error);
    return fail("Failed to load collections");
  }
}

export async function getCollection(id: string): Promise<ActionResult<CollectionDetail>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
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
      return fail(COLLECTION_NOT_FOUND_ERROR);
    }

    return ok({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      locations: collection.locations.map((location) => ({
        id: location.id,
        name: location.name,
        allSpies: location.allSpies,
        roles: location.roles.map((role) => ({ id: role.id, name: role.name })),
      })),
    });
  } catch (error) {
    console.error("getCollection failed:", error);
    return fail("Failed to load collection");
  }
}

export async function createCollection(
  input: CreateCollectionInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  const parsed = createCollectionInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
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

export async function updateCollection(
  input: UpdateCollectionInput,
): Promise<ActionResult<{ updated: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  const parsed = updateCollectionInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
  }

  try {
    const existing = await prisma.locationCollection.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });
    if (!existing) {
      return fail(COLLECTION_NOT_FOUND_ERROR);
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

export async function deleteCollection(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  try {
    const existing = await prisma.locationCollection.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return fail(COLLECTION_NOT_FOUND_ERROR);
    }

    await prisma.locationCollection.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    console.error("deleteCollection failed:", error);
    return fail("Failed to delete collection");
  }
}

export async function addLocationToCollection(
  input: AddLocationInput,
): Promise<ActionResult<CollectionLocationItem>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  const parsed = addLocationInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
  }

  try {
    const collection = await prisma.locationCollection.findFirst({
      where: { id: parsed.data.collectionId, userId: user.id },
    });
    if (!collection) {
      return fail(COLLECTION_NOT_FOUND_ERROR);
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
      roles: location.roles.map((role) => ({ id: role.id, name: role.name })),
    });
  } catch (error) {
    console.error("addLocationToCollection failed:", error);
    return fail("Failed to add location");
  }
}

export async function updateCollectionLocation(
  input: UpdateLocationInput,
): Promise<ActionResult<{ updated: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  const parsed = updateLocationInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
  }

  try {
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

export async function removeLocationFromCollection(
  input: RemoveLocationInput,
): Promise<ActionResult<{ deleted: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  const parsed = removeLocationInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
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

export async function getSavedLocationImports(): Promise<ActionResult<SavedLocationImportItem[]>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  try {
    const savedLocations = await prisma.savedLocation.findMany({
      where: { userId: user.id },
      include: { roles: { orderBy: { order: "asc" } } },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    });

    return ok(
      savedLocations.map((location) => ({
        id: location.id,
        name: location.name,
        category: location.category,
        allSpies: location.allSpies,
        roles: location.roles.map((role) => ({
          id: role.id,
          name: role.name,
        })),
      })),
    );
  } catch (error) {
    console.error("getSavedLocationImports failed:", error);
    return fail("Failed to load saved locations");
  }
}

export async function importSavedLocationToCollection(
  input: ImportSavedLocationToCollectionInput,
): Promise<ActionResult<CollectionLocationItem>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  const parsed = importSavedLocationToCollectionInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
  }

  try {
    const collection = await prisma.locationCollection.findFirst({
      where: { id: parsed.data.collectionId, userId: user.id },
    });
    if (!collection) {
      return fail(COLLECTION_NOT_FOUND_ERROR);
    }

    const savedLocation = await prisma.savedLocation.findFirst({
      where: { id: parsed.data.savedLocationId, userId: user.id },
      include: { roles: { orderBy: { order: "asc" } } },
    });
    if (!savedLocation) {
      return fail("Saved location not found");
    }

    const importedLocation = await prisma.collectionLocation.create({
      data: {
        collectionId: parsed.data.collectionId,
        name: savedLocation.name,
        allSpies: savedLocation.allSpies,
        roles: {
          create: savedLocation.roles.map((role) => ({
            name: role.name,
          })),
        },
      },
      include: { roles: true },
    });

    return ok({
      id: importedLocation.id,
      name: importedLocation.name,
      allSpies: importedLocation.allSpies,
      roles: importedLocation.roles.map((role) => ({
        id: role.id,
        name: role.name,
      })),
    });
  } catch (error) {
    console.error("importSavedLocationToCollection failed:", error);
    return fail("Failed to import saved location");
  }
}
