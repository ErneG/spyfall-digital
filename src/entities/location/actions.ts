"use server";

import { z } from "zod/v4";

import { prisma } from "@/shared/lib/prisma";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

import {
  createCustomLocationInput,
  deleteCustomLocationInput,
  type CustomLocationItem,
  type LocationsResponse,
  updateCustomLocationInput,
  updateLocationsInput,
} from "./schema";

const codeField = z.object({ code: z.string().min(1) });

const updateLocationsWithCode = updateLocationsInput.extend(codeField.shape);
const createCustomLocationWithCode = createCustomLocationInput.extend(codeField.shape);
const updateCustomLocationWithCode = updateCustomLocationInput.extend(codeField.shape);
const deleteCustomLocationWithCode = deleteCustomLocationInput.extend(codeField.shape);

const ROOM_NOT_FOUND_ERROR = "Room not found";

export async function updateLocationSelections(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const parsed = updateLocationsWithCode.safeParse(input);
  if (!parsed.success) {
    return fail("playerId and locationIds[] required");
  }

  const { code, playerId, locationIds } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!room) {
      return fail(ROOM_NOT_FOUND_ERROR);
    }
    if (room.hostId !== playerId) {
      return fail("Host only");
    }
    if (room.state !== "LOBBY") {
      return fail("Game in progress");
    }

    await prisma.$transaction([
      prisma.roomLocation.deleteMany({ where: { roomId: room.id } }),
      prisma.roomLocation.createMany({
        data: locationIds.map((locationId) => ({
          roomId: room.id,
          locationId,
        })),
      }),
    ]);

    return ok({ count: locationIds.length });
  } catch (error) {
    console.error("updateLocationSelections failed:", error);
    return fail("Failed to update locations");
  }
}

export async function createCustomLocation(
  input: unknown,
): Promise<ActionResult<CustomLocationItem>> {
  const parsed = createCustomLocationWithCode.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input");
  }

  const { code, playerId, name, roles, allSpies } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!room) {
      return fail(ROOM_NOT_FOUND_ERROR);
    }
    if (room.hostId !== playerId) {
      return fail("Host only");
    }

    const customLocation = await prisma.customLocation.create({
      data: {
        roomId: room.id,
        name,
        allSpies,
        roles: {
          create: roles.map((roleName) => ({ name: roleName })),
        },
      },
      include: { roles: true },
    });

    return ok({
      id: customLocation.id,
      name: customLocation.name,
      allSpies: customLocation.allSpies,
      selected: customLocation.selected,
      roles: customLocation.roles.map((role) => ({ id: role.id, name: role.name })),
    });
  } catch (error) {
    console.error("createCustomLocation failed:", error);
    return fail("Failed to create custom location");
  }
}

export async function updateCustomLocation(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  const parsed = updateCustomLocationWithCode.safeParse(input);
  if (!parsed.success) {
    return fail("playerId and locationId required");
  }

  const { code, playerId, locationId, name, roles, allSpies, selected } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!room) {
      return fail(ROOM_NOT_FOUND_ERROR);
    }
    if (room.hostId !== playerId) {
      return fail("Host only");
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (allSpies !== undefined) {
      updateData.allSpies = allSpies;
    }
    if (selected !== undefined) {
      updateData.selected = selected;
    }

    await prisma.$transaction(async (tx) => {
      await tx.customLocation.update({
        where: { id: locationId },
        data: updateData,
      });

      if (roles !== undefined) {
        await tx.customLocationRole.deleteMany({
          where: { customLocationId: locationId },
        });
        await tx.customLocationRole.createMany({
          data: roles.map((roleName) => ({
            customLocationId: locationId,
            name: roleName,
          })),
        });
      }
    });

    return ok({ success: true as const });
  } catch (error) {
    console.error("updateCustomLocation failed:", error);
    return fail("Failed to update custom location");
  }
}

export async function getLocations(roomCode: string): Promise<ActionResult<LocationsResponse>> {
  if (!roomCode) {
    return fail("Room code is required");
  }

  try {
    const room = await prisma.room.findUnique({
      where: { code: roomCode.toUpperCase() },
      include: {
        selectedLocations: { select: { locationId: true } },
        customLocations: {
          include: { roles: { select: { id: true, name: true } } },
        },
      },
    });

    if (!room) {
      return fail(ROOM_NOT_FOUND_ERROR);
    }

    const allLocations = await prisma.location.findMany({
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    });

    const selectedIds = new Set(room.selectedLocations.map((selection) => selection.locationId));

    return ok({
      locations: allLocations.map((location) => ({
        ...location,
        selected: selectedIds.has(location.id),
      })),
      customLocations: room.customLocations.map((location) => ({
        id: location.id,
        name: location.name,
        allSpies: location.allSpies,
        selected: location.selected,
        roles: location.roles,
      })),
    });
  } catch (error) {
    console.error("getLocations failed:", error);
    return fail("Failed to get locations");
  }
}

export async function deleteCustomLocation(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  const parsed = deleteCustomLocationWithCode.safeParse(input);
  if (!parsed.success) {
    return fail("playerId and locationId required");
  }

  const { code, playerId, locationId } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!room) {
      return fail(ROOM_NOT_FOUND_ERROR);
    }
    if (room.hostId !== playerId) {
      return fail("Host only");
    }

    await prisma.customLocation.delete({ where: { id: locationId } });

    return ok({ success: true as const });
  } catch (error) {
    console.error("deleteCustomLocation failed:", error);
    return fail("Failed to delete custom location");
  }
}
