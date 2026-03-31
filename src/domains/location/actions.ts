"use server";

import { z } from "zod/v4";

import {
  updateLocationsInput,
  createCustomLocationInput,
  updateCustomLocationInput,
  deleteCustomLocationInput,
  type CustomLocationItem,
  type LocationsResponse,
} from "@/domains/location/schema";
import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

const codeField = z.object({ code: z.string().min(1) });

const updateLocationsWithCode = updateLocationsInput.extend(codeField.shape);
const createCustomLocationWithCode = createCustomLocationInput.extend(codeField.shape);
const updateCustomLocationWithCode = updateCustomLocationInput.extend(codeField.shape);
const deleteCustomLocationWithCode = deleteCustomLocationInput.extend(codeField.shape);

// ─── updateLocationSelections ──────────────────────────────────
// Replaces PUT /api/rooms/[code]/locations

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
    if (!room) {return fail("Room not found");}
    if (room.hostId !== playerId) {return fail("Host only");}
    if (room.state !== "LOBBY") {return fail("Game in progress");}

    await prisma.$transaction([
      prisma.roomLocation.deleteMany({ where: { roomId: room.id } }),
      prisma.roomLocation.createMany({
        data: locationIds.map((locationId: string) => ({
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

// ─── createCustomLocation ──────────────────────────────────────
// Replaces POST /api/rooms/[code]/custom-locations

export async function createCustomLocation(
  input: unknown,
): Promise<ActionResult<CustomLocationItem>> {
  const parsed = createCustomLocationWithCode.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input");
  }

  const { code, playerId, name, roles, allSpies: isAllSpies } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!room) {return fail("Room not found");}
    if (room.hostId !== playerId) {return fail("Host only");}

    const customLocation = await prisma.customLocation.create({
      data: {
        roomId: room.id,
        name,
        allSpies: isAllSpies,
        roles: {
          create: roles.map((r: string) => ({ name: r })),
        },
      },
      include: { roles: true },
    });

    return ok({
      id: customLocation.id,
      name: customLocation.name,
      allSpies: customLocation.allSpies,
      selected: customLocation.selected,
      roles: customLocation.roles.map((r) => ({ id: r.id, name: r.name })),
    });
  } catch (error) {
    console.error("createCustomLocation failed:", error);
    return fail("Failed to create custom location");
  }
}

// ─── updateCustomLocation ──────────────────────────────────────
// Replaces PATCH /api/rooms/[code]/custom-locations

export async function updateCustomLocation(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  const parsed = updateCustomLocationWithCode.safeParse(input);
  if (!parsed.success) {
    return fail("playerId and locationId required");
  }

  const {
    code,
    playerId,
    locationId,
    name,
    roles,
    allSpies: isAllSpies,
    selected: isSelected,
  } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!room) {return fail("Room not found");}
    if (room.hostId !== playerId) {return fail("Host only");}

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {updateData.name = name;}
    if (isAllSpies !== undefined) {updateData.allSpies = isAllSpies;}
    if (isSelected !== undefined) {updateData.selected = isSelected;}

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
          data: roles.map((r: string) => ({
            customLocationId: locationId,
            name: r,
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

// ─── getLocations ─────────────────────────────────────────────
// Replaces GET /api/rooms/[code]/locations

export async function getLocations(roomCode: string): Promise<ActionResult<LocationsResponse>> {
  if (!roomCode) {return fail("Room code is required");}

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

    if (!room) {return fail("Room not found");}

    const allLocations = await prisma.location.findMany({
      select: { id: true, name: true, edition: true },
      orderBy: { name: "asc" },
    });

    const selectedIds = new Set(room.selectedLocations.map((sl) => sl.locationId));

    return ok({
      locations: allLocations.map((loc) => ({
        ...loc,
        selected: selectedIds.has(loc.id),
      })),
      customLocations: room.customLocations.map((cl) => ({
        id: cl.id,
        name: cl.name,
        allSpies: cl.allSpies,
        selected: cl.selected,
        roles: cl.roles,
      })),
    });
  } catch (error) {
    console.error("getLocations failed:", error);
    return fail("Failed to get locations");
  }
}

// ─── deleteCustomLocation ──────────────────────────────────────
// Replaces DELETE /api/rooms/[code]/custom-locations

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
    if (!room) {return fail("Room not found");}
    if (room.hostId !== playerId) {return fail("Host only");}

    await prisma.customLocation.delete({ where: { id: locationId } });

    return ok({ success: true as const });
  } catch (error) {
    console.error("deleteCustomLocation failed:", error);
    return fail("Failed to delete custom location");
  }
}
