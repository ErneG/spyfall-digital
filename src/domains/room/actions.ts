"use server";

import {
  createRoomInput,
  joinRoomInput,
  updateRoomConfigInput,
  applyRoomContentSourceInput,
  createPassAndPlayInput,
  getRoomStateInput,
  type CreateRoomInput,
  type CreateRoomOutput,
  type JoinRoomInput,
  type JoinRoomOutput,
  type UpdateRoomConfigInput,
  type UpdateRoomConfigOutput,
  type ApplyRoomContentSourceInput,
  type ApplyRoomContentSourceOutput,
  type CreatePassAndPlayOutput,
} from "@/domains/room/schema";
import { applyRoomContentSource as applyRoomContentSourceUseCase } from "@/entities/room/apply-content-source";
import { generateUniqueRoomCode } from "@/entities/room/code";
import { createPassAndPlayRoom as createPassAndPlayRoomUseCase } from "@/entities/room/pass-and-play";
import { type RoomState } from "@/entities/room/state";
import { getAuthUser } from "@/shared/lib/auth-session";
import { MAX_PLAYERS } from "@/shared/lib/constants";
import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

const INVALID_INPUT_ERROR = "Invalid input";

/** Link player to authenticated user and save name to history. */
async function linkPlayerToUser(playerId: string, playerName: string) {
  const user = await getAuthUser();
  if (!user) {
    return;
  }

  await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data: { userId: user.id },
    }),
    prisma.nameHistory.upsert({
      where: { userId_name: { userId: user.id, name: playerName } },
      update: { usedAt: new Date() },
      create: { userId: user.id, name: playerName },
    }),
  ]);
}

async function readRoomStateByCode(code: string): Promise<RoomState | null> {
  const room = await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      players: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, isHost: true, isOnline: true, moderatorRole: true },
      },
      games: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { id: true, state: true, startedAt: true, timerRunning: true },
      },
      selectedLocations: { select: { locationId: true } },
      _count: { select: { customLocations: { where: { selected: true } } } },
    },
  });
  if (!room) {
    return null;
  }

  const latestGame = room.games.at(0);
  const totalLocations = await prisma.location.count();
  const currentGameId = latestGame ? latestGame.id : null;
  const gameStartedAt = latestGame ? latestGame.startedAt.toISOString() : null;
  const timerRunning = latestGame ? latestGame.timerRunning : true;

  return {
    state: room.state,
    players: room.players,
    timeLimit: room.timeLimit,
    spyCount: room.spyCount,
    autoStartTimer: room.autoStartTimer,
    hideSpyCount: room.hideSpyCount,
    moderatorMode: room.moderatorMode,
    moderatorLocationId: room.moderatorLocationId,
    selectedLocationCount: room.selectedLocations.length + room._count.customLocations,
    totalLocationCount: totalLocations,
    currentGameId,
    gameStartedAt,
    timerRunning,
  };
}

// ─── createRoom ────────────────────────────────────────────
// Replaces POST /api/rooms

export async function createRoom(input: CreateRoomInput): Promise<ActionResult<CreateRoomOutput>> {
  const parsed = createRoomInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
  }

  const { hostName, timeLimit, spyCount } = parsed.data;

  try {
    const code = await generateUniqueRoomCode();
    if (!code) {
      return fail("Failed to generate unique room code");
    }

    // Get all locations to auto-select them
    const allLocations = await prisma.location.findMany({
      select: { id: true },
    });

    const room = await prisma.room.create({
      data: {
        code,
        timeLimit,
        spyCount,
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

    // Link to authenticated user (non-blocking — don't fail room creation)
    await linkPlayerToUser(host.id, hostName).catch(() => {});

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

export async function joinRoom(input: JoinRoomInput): Promise<ActionResult<JoinRoomOutput>> {
  const parsed = joinRoomInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
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

    if (room.state === "FINISHED") {
      return fail("This room has ended");
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

    // Link to authenticated user (non-blocking)
    await linkPlayerToUser(player.id, playerName).catch(() => {});

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

export async function updateRoomConfig(
  input: UpdateRoomConfigInput,
): Promise<ActionResult<UpdateRoomConfigOutput>> {
  const parsed = updateRoomConfigInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
  }

  const { roomCode, playerId, ...config } = parsed.data;

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

    const updated = await prisma.room.update({
      where: { id: room.id },
      data: {
        ...(config.timeLimit !== undefined && { timeLimit: config.timeLimit }),
        ...(config.spyCount !== undefined && { spyCount: config.spyCount }),
        ...(config.autoStartTimer !== undefined && { autoStartTimer: config.autoStartTimer }),
        ...(config.hideSpyCount !== undefined && { hideSpyCount: config.hideSpyCount }),
        ...(config.moderatorMode !== undefined && { moderatorMode: config.moderatorMode }),
        ...(config.moderatorLocationId !== undefined && {
          moderatorLocationId: config.moderatorLocationId ?? null,
        }),
      },
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

export async function applyRoomContentSource(
  input: ApplyRoomContentSourceInput,
): Promise<ActionResult<ApplyRoomContentSourceOutput>> {
  const parsed = applyRoomContentSourceInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
  }

  return applyRoomContentSourceUseCase(parsed.data);
}

export async function getRoomState(input: unknown): Promise<ActionResult<RoomState>> {
  const parsed = getRoomStateInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
  }

  try {
    const room = await readRoomStateByCode(parsed.data.roomCode);
    if (!room) {
      return fail("Room not found");
    }

    return ok(room);
  } catch (error) {
    console.error("getRoomState failed:", error);
    return fail("Failed to load room");
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
    return fail(parsed.error.issues[0]?.message ?? INVALID_INPUT_ERROR);
  }

  return createPassAndPlayRoomUseCase(parsed.data);
}
