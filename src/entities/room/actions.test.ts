import { beforeEach, describe, expect, it, vi } from "vitest";

const applyRoomContentSourceUseCase = vi.fn();
const createPassAndPlayRoomUseCase = vi.fn();
const generateUniqueRoomCode = vi.fn();
const getAuthUser = vi.fn();
const roomFindUnique = vi.fn();
const roomCreate = vi.fn();
const roomUpdate = vi.fn();
const playerCreate = vi.fn();
const playerUpdate = vi.fn();
const nameHistoryUpsert = vi.fn();
const locationFindMany = vi.fn();
const locationCount = vi.fn();
const transaction = vi.fn();

vi.mock("@/entities/room/apply-content-source", () => ({
  applyRoomContentSource: applyRoomContentSourceUseCase,
}));

vi.mock("@/entities/room/pass-and-play", () => ({
  createPassAndPlayRoom: createPassAndPlayRoomUseCase,
}));

vi.mock("@/entities/room/code", () => ({
  generateUniqueRoomCode,
}));

vi.mock("@/shared/lib/auth-session", () => ({
  getAuthUser,
}));

type MockTransactionClient = {
  room: {
    create: typeof roomCreate;
    update: typeof roomUpdate;
  };
};

type MockTransactionInput =
  | ((client: MockTransactionClient) => Promise<unknown>)
  | Promise<unknown>[];

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    room: {
      create: roomCreate,
      findUnique: roomFindUnique,
      update: roomUpdate,
    },
    player: {
      create: playerCreate,
      update: playerUpdate,
    },
    nameHistory: {
      upsert: nameHistoryUpsert,
    },
    location: {
      count: locationCount,
      findMany: locationFindMany,
    },
    $transaction: transaction,
  },
}));

describe("room entity actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    generateUniqueRoomCode.mockResolvedValue("ABCDE");
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
    getAuthUser.mockResolvedValue(null);
    playerUpdate.mockResolvedValue({});
    nameHistoryUpsert.mockResolvedValue({});
  });

  it("creates a room with the full built-in catalog selected", async () => {
    locationFindMany.mockResolvedValue([{ id: "loc-1" }, { id: "loc-2" }]);
    roomCreate.mockResolvedValue({
      id: "room-1",
      code: "ABCDE",
      timeLimit: 480,
      spyCount: 1,
      players: [{ id: "player-1", name: "Alice", isHost: true }],
    });
    roomUpdate.mockResolvedValue({});

    const roomActions = await import("./actions");
    const result = await roomActions.createRoom({
      hostName: "Alice",
      timeLimit: 480,
      spyCount: 1,
    });

    expect(result).toEqual({
      success: true,
      data: {
        roomId: "room-1",
        code: "ABCDE",
        playerId: "player-1",
        timeLimit: 480,
        spyCount: 1,
      },
    });
    expect(locationFindMany).toHaveBeenCalledWith({
      select: { id: true },
    });
    expect(roomCreate).toHaveBeenCalledWith({
      data: {
        code: "ABCDE",
        timeLimit: 480,
        spyCount: 1,
        hostId: "",
        players: {
          create: { name: "Alice", isHost: true },
        },
        selectedLocations: {
          create: [{ locationId: "loc-1" }, { locationId: "loc-2" }],
        },
      },
      include: { players: true },
    });
    expect(roomUpdate).toHaveBeenCalledWith({
      where: { id: "room-1" },
      data: { hostId: "player-1" },
    });
  });

  it("joins a lobby room when capacity allows", async () => {
    roomFindUnique.mockResolvedValue({
      id: "room-1",
      code: "ABCDE",
      state: "LOBBY",
      players: [{ id: "player-1" }, { id: "player-2" }],
    });
    playerCreate.mockResolvedValue({
      id: "player-3",
      roomId: "room-1",
    });

    const roomActions = await import("./actions");
    const result = await roomActions.joinRoom({
      roomCode: "ABCDE",
      playerName: "Charlie",
    });

    expect(result).toEqual({
      success: true,
      data: {
        playerId: "player-3",
        roomId: "room-1",
        code: "ABCDE",
      },
    });
    expect(playerCreate).toHaveBeenCalledWith({
      data: {
        name: "Charlie",
        roomId: "room-1",
      },
    });
  });

  it("normalizes room state for the UI", async () => {
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
    locationCount.mockResolvedValue(54);

    const roomActions = await import("./actions");
    const result = await roomActions.getRoomState({ roomCode: "abcde" });

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

  it("routes source changes and pass-and-play creation through entity use cases", async () => {
    applyRoomContentSourceUseCase.mockResolvedValue({
      success: true,
      data: { selectedLocationCount: 8, sourceKind: "built-in" },
    });
    createPassAndPlayRoomUseCase.mockResolvedValue({
      success: true,
      data: { roomId: "room-pp" },
    });

    const roomActions = await import("./actions");

    await expect(
      roomActions.applyRoomContentSource({
        roomCode: "ABCDE",
        playerId: "player-1",
        source: { kind: "built-in", categories: ["Transportation"] },
      }),
    ).resolves.toEqual({
      success: true,
      data: { selectedLocationCount: 8, sourceKind: "built-in" },
    });
    await expect(
      roomActions.createPassAndPlayRoom({
        players: { names: ["Alice", "Bob", "Charlie"] },
        settings: { timeLimit: 480, spyCount: 1, hideSpyCount: false },
        source: { kind: "built-in", categories: ["Transportation"] },
      }),
    ).resolves.toEqual({
      success: true,
      data: { roomId: "room-pp" },
    });
  });
});
