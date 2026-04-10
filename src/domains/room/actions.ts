"use server";

import {
  createRoomInput,
  joinRoomInput,
  updateRoomConfigInput,
  createPassAndPlayInput,
  getRoomStateInput,
  type CreateRoomInput,
  type CreateRoomOutput,
  type JoinRoomInput,
  type JoinRoomOutput,
  type UpdateRoomConfigInput,
  type UpdateRoomConfigOutput,
  type CreatePassAndPlayOutput,
} from "@/domains/room/schema";
import {
  type CollectionContentSourceInput,
  type ContentSourceInput,
  resolveBuiltInContentSourceLocations,
  resolveCollectionContentSourceLocations,
} from "@/entities/library/content-source";
import { type RoomState } from "@/entities/room/state";
import { getAuthUser } from "@/shared/lib/auth-session";
import { MAX_PLAYERS } from "@/shared/lib/constants";
import { prisma } from "@/shared/lib/prisma";
import { generateRoomCode } from "@/shared/lib/room-code";
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

async function generateUniqueRoomCode(): Promise<string | null> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateRoomCode();
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) {
      return code;
    }
  }

  return null;
}

async function getCollectionPassAndPlayLocations(
  source: CollectionContentSourceInput,
): Promise<
  | { success: true; customLocations: Array<{ allSpies: boolean; name: string; roles: string[] }> }
  | { success: false; error: string }
> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Sign in to use saved collections" };
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

  const { players, settings, source } = parsed.data;
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

    // Create room + all players in a transaction
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
      players: room.players.map((p) => ({ id: p.id, name: p.name })),
    });
  } catch (error) {
    console.error("createPassAndPlayRoom failed:", error);
    return fail("Failed to create pass-and-play room");
  }
}
