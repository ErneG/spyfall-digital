"use server";

import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";
import {
  createRoomInput,
  joinRoomInput,
  updateRoomConfigInput,
  createPassAndPlayInput,
  type CreateRoomInput,
  type CreateRoomOutput,
  type JoinRoomInput,
  type JoinRoomOutput,
  type CreatePassAndPlayOutput,
} from "@/domains/room/schema";
import { generateRoomCode } from "@/shared/lib/room-code";
import { DEFAULT_TIME_LIMIT, MAX_PLAYERS } from "@/shared/lib/constants";

// ─── createRoom ────────────────────────────────────────────
// Replaces POST /api/rooms

export async function createRoom(
  input: CreateRoomInput,
): Promise<ActionResult<CreateRoomOutput>> {
  const parsed = createRoomInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { hostName, timeLimit, spyCount } = parsed.data;

  try {
    // Generate unique room code (up to 10 attempts)
    let code = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      code = generateRoomCode();
      const existing = await prisma.room.findUnique({ where: { code } });
      if (!existing) break;
      if (attempt === 9) {
        return fail("Failed to generate unique room code");
      }
    }

    // Get all locations to auto-select them
    const allLocations = await prisma.location.findMany({
      select: { id: true },
    });

    const room = await prisma.room.create({
      data: {
        code,
        timeLimit: timeLimit ?? DEFAULT_TIME_LIMIT,
        spyCount: spyCount ?? 1,
        hostId: "",
        players: {
          create: { name: hostName, isHost: true },
        },
        selectedLocations: {
          create: allLocations.map((loc) => ({ locationId: loc.id })),
        },
      },
      include: { players: true },
    });

    const host = room.players[0];
    await prisma.room.update({
      where: { id: room.id },
      data: { hostId: host.id },
    });

    return ok({
      roomId: room.id,
      code: room.code,
      playerId: host.id,
      timeLimit: room.timeLimit,
      spyCount: room.spyCount,
    });
  } catch (error) {
    console.error("createRoom failed:", error);
    return fail("Failed to create room");
  }
}

// ─── joinRoom ──────────────────────────────────────────────
// Replaces POST /api/rooms/[code]

export async function joinRoom(
  input: JoinRoomInput,
): Promise<ActionResult<JoinRoomOutput>> {
  const parsed = joinRoomInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { playerName, roomCode } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      include: { players: true },
    });

    if (!room) {
      return fail("Room not found");
    }

    if (room.state !== "LOBBY") {
      return fail("Game already in progress");
    }

    if (room.players.length >= MAX_PLAYERS) {
      return fail("Room is full");
    }

    const player = await prisma.player.create({
      data: {
        name: playerName,
        roomId: room.id,
      },
    });

    return ok({
      playerId: player.id,
      roomId: room.id,
      code: room.code,
    });
  } catch (error) {
    console.error("joinRoom failed:", error);
    return fail("Failed to join room");
  }
}

// ─── updateRoomConfig ──────────────────────────────────────
// Replaces PATCH /api/rooms/[code]/config

type UpdateRoomConfigOutput = {
  timeLimit: number;
  spyCount: number;
  autoStartTimer: boolean;
  hideSpyCount: boolean;
  moderatorMode: boolean;
  moderatorLocationId: string | null;
};

export async function updateRoomConfig(
  input: { roomCode: string } & Record<string, unknown>,
): Promise<ActionResult<UpdateRoomConfigOutput>> {
  // Validate the config fields (excluding roomCode which is routing info)
  const { roomCode, ...rest } = input;

  if (!roomCode || typeof roomCode !== "string" || roomCode.length !== 5) {
    return fail("Invalid room code");
  }

  const parsed = updateRoomConfigInput.safeParse(rest);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { playerId, ...config } = parsed.data;

  try {
    const room = await prisma.room.findUnique({
      where: { code: roomCode.toUpperCase() },
    });

    if (!room) {
      return fail("Room not found");
    }

    if (room.hostId !== playerId) {
      return fail("Only the host can change settings");
    }

    if (room.state !== "LOBBY") {
      return fail("Cannot change settings during a game");
    }

    // Build update object from allowed fields
    const updateData: Record<string, unknown> = {};
    if (config.timeLimit !== undefined) updateData.timeLimit = config.timeLimit;
    if (config.spyCount !== undefined) updateData.spyCount = config.spyCount;
    if (config.autoStartTimer !== undefined)
      updateData.autoStartTimer = config.autoStartTimer;
    if (config.hideSpyCount !== undefined)
      updateData.hideSpyCount = config.hideSpyCount;
    if (config.moderatorMode !== undefined)
      updateData.moderatorMode = config.moderatorMode;
    if (config.moderatorLocationId !== undefined)
      updateData.moderatorLocationId = config.moderatorLocationId ?? null;

    const updated = await prisma.room.update({
      where: { id: room.id },
      data: updateData,
    });

    return ok({
      timeLimit: updated.timeLimit,
      spyCount: updated.spyCount,
      autoStartTimer: updated.autoStartTimer,
      hideSpyCount: updated.hideSpyCount,
      moderatorMode: updated.moderatorMode,
      moderatorLocationId: updated.moderatorLocationId,
    });
  } catch (error) {
    console.error("updateRoomConfig failed:", error);
    return fail("Failed to update config");
  }
}

// ─── createPassAndPlayRoom ─────────────────────────────────
// Creates room + all players in one go (single-device mode).
// Client then calls startGame from game/actions.ts to begin.

export async function createPassAndPlayRoom(
  input: unknown,
): Promise<ActionResult<CreatePassAndPlayOutput>> {
  const parsed = createPassAndPlayInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { playerNames, timeLimit, spyCount, hideSpyCount: shouldHideSpyCount } = parsed.data;

  try {
    // Generate unique room code
    let code = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      code = generateRoomCode();
      const existing = await prisma.room.findUnique({ where: { code } });
      if (!existing) break;
      if (attempt === 9) return fail("Failed to generate unique room code");
    }

    // Fetch all locations to auto-select them
    const allLocations = await prisma.location.findMany({
      select: { id: true },
    });

    // Create room + all players in a transaction
    const room = await prisma.$transaction(async (tx) => {
      const created = await tx.room.create({
        data: {
          code,
          timeLimit: timeLimit ?? DEFAULT_TIME_LIMIT,
          spyCount: spyCount ?? 1,
          hideSpyCount: shouldHideSpyCount ?? false,
          autoStartTimer: false, // Timer starts paused for role reveal
          hostId: "",
          players: {
            create: playerNames.map((name, index) => ({
              name,
              isHost: index === 0,
            })),
          },
          selectedLocations: {
            create: allLocations.map((loc) => ({ locationId: loc.id })),
          },
        },
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

    return ok({
      roomId: room.id,
      code: room.code,
      hostPlayerId: host.id,
      players: room.players.map((p) => ({ id: p.id, name: p.name })),
    });
  } catch (error) {
    console.error("createPassAndPlayRoom failed:", error);
    return fail("Failed to create pass-and-play room");
  }
}
