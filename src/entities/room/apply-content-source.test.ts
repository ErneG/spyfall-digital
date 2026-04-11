import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthUser = vi.fn();
const roomFindUnique = vi.fn();
const locationFindMany = vi.fn();
const collectionFindFirst = vi.fn();
const roomLocationDeleteMany = vi.fn();
const roomLocationCreateMany = vi.fn();
const customLocationDeleteMany = vi.fn();
const customLocationCreate = vi.fn();
const transaction = vi.fn();

type MockTransactionClient = {
  customLocation: {
    create: typeof customLocationCreate;
    deleteMany: typeof customLocationDeleteMany;
  };
  roomLocation: {
    createMany: typeof roomLocationCreateMany;
    deleteMany: typeof roomLocationDeleteMany;
  };
};

vi.mock("@/shared/lib/auth-session", () => ({
  getAuthUser,
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    room: {
      findUnique: roomFindUnique,
    },
    location: {
      findMany: locationFindMany,
    },
    locationCollection: {
      findFirst: collectionFindFirst,
    },
    roomLocation: {
      createMany: roomLocationCreateMany,
      deleteMany: roomLocationDeleteMany,
    },
    customLocation: {
      create: customLocationCreate,
      deleteMany: customLocationDeleteMany,
    },
    $transaction: transaction,
  },
}));

describe("applyRoomContentSource", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    transaction.mockImplementation((callback: (client: MockTransactionClient) => unknown) =>
      callback({
        customLocation: {
          create: customLocationCreate,
          deleteMany: customLocationDeleteMany,
        },
        roomLocation: {
          createMany: roomLocationCreateMany,
          deleteMany: roomLocationDeleteMany,
        },
      }),
    );
  });

  it("replaces the room pool with the resolved built-in catalog locations", async () => {
    roomFindUnique.mockResolvedValue({
      code: "ABCDE",
      hostId: "player-1",
      id: "room-1",
      state: "LOBBY",
    });
    locationFindMany.mockResolvedValue([{ id: "seed-1" }, { id: "seed-2" }]);

    const { applyRoomContentSource } = await import("./apply-content-source");
    const result = await applyRoomContentSource({
      playerId: "player-1",
      roomCode: "abcde",
      source: {
        kind: "built-in",
        categories: ["Transportation"],
      },
    });

    expect(result).toEqual({
      success: true,
      data: {
        selectedLocationCount: 2,
        sourceKind: "built-in",
      },
    });
    expect(roomLocationDeleteMany).toHaveBeenCalledWith({
      where: { roomId: "room-1" },
    });
    expect(customLocationDeleteMany).toHaveBeenCalledWith({
      where: { roomId: "room-1" },
    });
    expect(roomLocationCreateMany).toHaveBeenCalledWith({
      data: [
        { locationId: "seed-1", roomId: "room-1" },
        { locationId: "seed-2", roomId: "room-1" },
      ],
    });
  });

  it("replaces the room pool with a saved collection snapshot", async () => {
    roomFindUnique.mockResolvedValue({
      code: "ABCDE",
      hostId: "player-1",
      id: "room-1",
      state: "LOBBY",
    });
    getAuthUser.mockResolvedValue({ id: "user-1" });
    collectionFindFirst.mockResolvedValue({
      id: "collection-1",
      locations: [
        {
          allSpies: false,
          id: "loc-1",
          name: "Safe House",
          roles: [{ name: "Handler" }, { name: "Courier" }],
        },
        {
          allSpies: true,
          id: "loc-2",
          name: "Burn Notice",
          roles: [],
        },
      ],
      userId: "user-1",
    });

    const { applyRoomContentSource } = await import("./apply-content-source");
    const result = await applyRoomContentSource({
      playerId: "player-1",
      roomCode: "ABCDE",
      source: {
        kind: "collection",
        collectionId: "collection-1",
      },
    });

    expect(result).toEqual({
      success: true,
      data: {
        selectedLocationCount: 2,
        sourceKind: "collection",
      },
    });
    expect(roomLocationDeleteMany).toHaveBeenCalledWith({
      where: { roomId: "room-1" },
    });
    expect(customLocationDeleteMany).toHaveBeenCalledWith({
      where: { roomId: "room-1" },
    });
    expect(customLocationCreate).toHaveBeenCalledTimes(2);
    expect(customLocationCreate).toHaveBeenNthCalledWith(1, {
      data: {
        roomId: "room-1",
        name: "Safe House",
        allSpies: false,
        selected: true,
        roles: {
          create: [{ name: "Handler" }, { name: "Courier" }],
        },
      },
    });
  });

  it("rejects collection-backed room sources when the user is not signed in", async () => {
    roomFindUnique.mockResolvedValue({
      code: "ABCDE",
      hostId: "player-1",
      id: "room-1",
      state: "LOBBY",
    });
    getAuthUser.mockResolvedValue(null);

    const { applyRoomContentSource } = await import("./apply-content-source");
    const result = await applyRoomContentSource({
      playerId: "player-1",
      roomCode: "ABCDE",
      source: {
        kind: "collection",
        collectionId: "collection-1",
      },
    });

    expect(result).toEqual({
      success: false,
      error: "Sign in to use Library collections",
    });
    expect(collectionFindFirst).not.toHaveBeenCalled();
  });
});
