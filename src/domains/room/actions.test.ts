import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthUser = vi.fn();
const generateRoomCode = vi.fn();
const roomFindUnique = vi.fn();
const locationFindMany = vi.fn();
const collectionFindFirst = vi.fn();
const playerUpdate = vi.fn();
const nameHistoryUpsert = vi.fn();
const roomCreate = vi.fn();
const roomUpdate = vi.fn();
const transaction = vi.fn();

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
    transaction.mockImplementation(async (input: unknown) => {
      if (typeof input === "function") {
        return input({
          room: {
            create: roomCreate,
            update: roomUpdate,
          },
        });
      }

      return Promise.all(input as Promise<unknown>[]);
    });
    playerUpdate.mockResolvedValue({});
    nameHistoryUpsert.mockResolvedValue({});
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
});
