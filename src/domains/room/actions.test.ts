import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthUser = vi.fn();
const generateRoomCode = vi.fn();
const roomFindUnique = vi.fn();
const locationFindMany = vi.fn();
const locationCount = vi.fn();
const collectionFindFirst = vi.fn();
const playerUpdate = vi.fn();
const nameHistoryUpsert = vi.fn();
const roomCreate = vi.fn();
const roomUpdate = vi.fn();
const transaction = vi.fn();

type MockTransactionClient = {
  room: {
    create: typeof roomCreate;
    update: typeof roomUpdate;
  };
};

type MockTransactionInput =
  | ((client: MockTransactionClient) => Promise<unknown>)
  | Promise<unknown>[];

vi.mock("@/shared/lib/auth-session", () => ({
  getAuthUser,
}));

vi.mock("@/shared/lib/room-code", () => ({
  generateRoomCode,
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    room: {
      findUnique: roomFindUnique,
      update: roomUpdate,
    },
    location: {
      findMany: locationFindMany,
      count: locationCount,
    },
    locationCollection: {
      findFirst: collectionFindFirst,
    },
    player: {
      update: playerUpdate,
    },
    nameHistory: {
      upsert: nameHistoryUpsert,
    },
    $transaction: transaction,
  },
}));

describe("createPassAndPlayRoom", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    generateRoomCode.mockReturnValue("ABCDE");
    roomFindUnique.mockResolvedValue(null);
    transaction.mockImplementation(async (input: MockTransactionInput) => {
      if (Array.isArray(input)) {
        return Promise.all(input);
      }

      return input({
        room: {
          create: roomCreate,
          update: roomUpdate,
        },
      });
    });
    playerUpdate.mockResolvedValue({});
    nameHistoryUpsert.mockResolvedValue({});
    locationCount.mockResolvedValue(54);
  });

  it("creates a collection-backed pass-and-play room using collection locations as custom locations", async () => {
    getAuthUser.mockResolvedValue({ id: "user-1" });
    collectionFindFirst.mockResolvedValue({
      id: "collection-1",
      userId: "user-1",
      locations: [
        {
          id: "loc-1",
          name: "Secret Lab",
          allSpies: false,
          roles: [{ name: "Scientist" }, { name: "Guard" }],
        },
        {
          id: "loc-2",
          name: "Undercover Briefing",
          allSpies: true,
          roles: [],
        },
      ],
    });
    roomCreate.mockResolvedValue({
      id: "room-1",
      code: "ABCDE",
      players: [
        { id: "player-1", name: "Alice" },
        { id: "player-2", name: "Bob" },
        { id: "player-3", name: "Charlie" },
      ],
    });

    const { createPassAndPlayRoom } = await import("./actions");
    const result = await createPassAndPlayRoom({
      players: { names: ["Alice", "Bob", "Charlie"] },
      settings: { timeLimit: 420, spyCount: 1, hideSpyCount: true },
      source: {
        kind: "collection",
        collectionId: "collection-1",
      },
    });

    expect(result).toEqual({
      success: true,
      data: {
        roomId: "room-1",
        code: "ABCDE",
        hostPlayerId: "player-1",
        players: [
          { id: "player-1", name: "Alice" },
          { id: "player-2", name: "Bob" },
          { id: "player-3", name: "Charlie" },
        ],
      },
    });
    expect(collectionFindFirst).toHaveBeenCalledWith({
      where: { id: "collection-1", userId: "user-1" },
      include: {
        locations: {
          include: { roles: true },
          orderBy: { name: "asc" },
        },
      },
    });
    expect(roomCreate).toHaveBeenCalledWith({
      data: {
        code: "ABCDE",
        timeLimit: 420,
        spyCount: 1,
        hideSpyCount: true,
        autoStartTimer: false,
        hostId: "",
        players: {
          create: [
            { name: "Alice", isHost: true },
            { name: "Bob", isHost: false },
            { name: "Charlie", isHost: false },
          ],
        },
        customLocations: {
          create: [
            {
              name: "Secret Lab",
              allSpies: false,
              selected: true,
              roles: {
                create: [{ name: "Scientist" }, { name: "Guard" }],
              },
            },
            {
              name: "Undercover Briefing",
              allSpies: true,
              selected: true,
              roles: {
                create: [],
              },
            },
          ],
        },
      },
      include: { players: { orderBy: { createdAt: "asc" } } },
    });
    expect(locationFindMany).not.toHaveBeenCalled();
  });

  it("rejects collection-backed pass-and-play when the user is not signed in", async () => {
    getAuthUser.mockResolvedValue(null);

    const { createPassAndPlayRoom } = await import("./actions");
    const result = await createPassAndPlayRoom({
      players: { names: ["Alice", "Bob", "Charlie"] },
      source: {
        kind: "collection",
        collectionId: "collection-1",
      },
    });

    expect(result).toEqual({
      success: false,
      error: "Sign in to use saved collections",
    });
    expect(collectionFindFirst).not.toHaveBeenCalled();
  });

  it("uses the resolved built-in catalog names when creating a built-in pass-and-play room", async () => {
    getAuthUser.mockResolvedValue(null);
    locationFindMany.mockResolvedValue([{ id: "seed-1" }, { id: "seed-2" }]);
    roomCreate.mockResolvedValue({
      id: "room-1",
      code: "ABCDE",
      players: [
        { id: "player-1", name: "Alice" },
        { id: "player-2", name: "Bob" },
        { id: "player-3", name: "Charlie" },
      ],
    });

    const { createPassAndPlayRoom } = await import("./actions");
    const result = await createPassAndPlayRoom({
      players: { names: ["Alice", "Bob", "Charlie"] },
      source: {
        kind: "built-in",
        categories: ["Transportation"],
      },
    });

    expect(result.success).toBe(true);
    expect(locationFindMany).toHaveBeenCalledOnce();
    const locationQuery = locationFindMany.mock.calls[0]?.[0] as {
      select: { id: true };
      where: {
        name: {
          in: string[];
        };
      };
    };

    expect(locationQuery.select).toEqual({ id: true });
    expect(locationQuery.where.name.in).toContain("Airplane");
    expect(locationQuery.where.name.in).toContain("Submarine");
    expect(locationQuery.where.name.in).toContain("Subway");
  });
});

describe("getRoomState", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    locationCount.mockResolvedValue(54);
  });

  it("returns normalized room state with ISO timestamps", async () => {
    roomFindUnique.mockResolvedValue({
      id: "room-1",
      state: "PLAYING",
      timeLimit: 480,
      spyCount: 2,
      autoStartTimer: false,
      hideSpyCount: true,
      moderatorMode: false,
      moderatorLocationId: null,
      players: [{ id: "p1", name: "Alice", isHost: true, isOnline: true, moderatorRole: null }],
      games: [
        {
          id: "game-1",
          state: "PLAYING",
          startedAt: new Date("2026-04-10T09:30:00.000Z"),
          timerRunning: true,
        },
      ],
      selectedLocations: [{ locationId: "seed-1" }, { locationId: "seed-2" }],
      _count: { customLocations: 1 },
    });

    const { getRoomState } = await import("./actions");
    const result = await getRoomState({ roomCode: "abcde" });

    expect(roomFindUnique).toHaveBeenCalledWith({
      where: { code: "ABCDE" },
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
    expect(result).toEqual({
      success: true,
      data: {
        state: "PLAYING",
        players: [{ id: "p1", name: "Alice", isHost: true, isOnline: true, moderatorRole: null }],
        timeLimit: 480,
        spyCount: 2,
        autoStartTimer: false,
        hideSpyCount: true,
        moderatorMode: false,
        moderatorLocationId: null,
        selectedLocationCount: 3,
        totalLocationCount: 54,
        currentGameId: "game-1",
        gameStartedAt: "2026-04-10T09:30:00.000Z",
        timerRunning: true,
      },
    });
  });

  it("fails when the room cannot be found", async () => {
    roomFindUnique.mockResolvedValue(null);

    const { getRoomState } = await import("./actions");
    const result = await getRoomState({ roomCode: "abcde" });

    expect(result).toEqual({
      success: false,
      error: "Room not found",
    });
  });
});
