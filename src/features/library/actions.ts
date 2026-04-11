"use server";

import { getAuthUser } from "@/shared/lib/auth-session";
import { prisma } from "@/shared/lib/prisma";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

import {
  deleteSavedLocationInput,
  savedLocationItemSchema,
  savedLocationsResponseSchema,
  upsertSavedLocationInput,
  type DeleteSavedLocationInput,
  type SavedLocationItem,
  type SavedLocationsResponse,
  type UpsertSavedLocationInput,
} from "./schema";

function toSavedLocationItem(location: {
  id: string;
  name: string;
  category: string;
  allSpies: boolean;
  updatedAt: Date;
  roles: Array<{ id: string; name: string }>;
}): SavedLocationItem {
  return savedLocationItemSchema.parse({
    id: location.id,
    name: location.name,
    category: location.category,
    allSpies: location.allSpies,
    updatedAt: location.updatedAt.toISOString(),
    roles: location.roles.map((role) => ({
      id: role.id,
      name: role.name,
    })),
  });
}

export async function getSavedLocations(): Promise<ActionResult<SavedLocationsResponse>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  try {
    const locations = await prisma.savedLocation.findMany({
      where: { userId: user.id },
      include: { roles: { orderBy: { order: "asc" } } },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    });

    return ok(
      savedLocationsResponseSchema.parse({
        locations: locations.map(toSavedLocationItem),
      }),
    );
  } catch (error) {
    console.error("getSavedLocations failed:", error);
    return fail("Failed to load saved locations");
  }
}

export async function upsertSavedLocation(
  input: UpsertSavedLocationInput,
): Promise<ActionResult<SavedLocationItem>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  const parsed = upsertSavedLocationInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    if (parsed.data.id) {
      const existing = await prisma.savedLocation.findFirst({
        where: { id: parsed.data.id, userId: user.id },
      });
      if (!existing) {
        return fail("Saved location not found");
      }

      const updatedLocation = await prisma.savedLocation.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          category: parsed.data.category,
          allSpies: parsed.data.allSpies,
          roles: {
            deleteMany: {},
            create: parsed.data.roles.map((name, index) => ({
              name,
              order: index,
            })),
          },
        },
        include: { roles: { orderBy: { order: "asc" } } },
      });

      return ok(toSavedLocationItem(updatedLocation));
    }

    const createdLocation = await prisma.savedLocation.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        category: parsed.data.category,
        allSpies: parsed.data.allSpies,
        roles: {
          create: parsed.data.roles.map((name, index) => ({
            name,
            order: index,
          })),
        },
      },
      include: { roles: { orderBy: { order: "asc" } } },
    });

    return ok(toSavedLocationItem(createdLocation));
  } catch (error) {
    console.error("upsertSavedLocation failed:", error);
    return fail("Failed to save location");
  }
}

export async function deleteSavedLocation(
  input: DeleteSavedLocationInput,
): Promise<ActionResult<{ deleted: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail("Not authenticated");
  }

  const parsed = deleteSavedLocationInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const existing = await prisma.savedLocation.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });
    if (!existing) {
      return fail("Saved location not found");
    }

    await prisma.savedLocation.delete({
      where: { id: parsed.data.id },
    });

    return ok({ deleted: true });
  } catch (error) {
    console.error("deleteSavedLocation failed:", error);
    return fail("Failed to delete location");
  }
}
