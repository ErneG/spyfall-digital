import { beforeEach, describe, expect, it, vi } from "vitest";

const { domainActionLeak, prisma } = vi.hoisted(() => ({
  domainActionLeak: vi.fn(() => {
    throw new Error("entity actions should not delegate to domain actions");
  }),
  prisma: {
    room: {
      findUnique: vi.fn(),
    },
    roomLocation: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    customLocation: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    customLocationRole: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    location: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/domains/location/actions", () => ({
  createCustomLocation: domainActionLeak,
  deleteCustomLocation: domainActionLeak,
  getLocations: domainActionLeak,
  updateCustomLocation: domainActionLeak,
  updateLocationSelections: domainActionLeak,
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma,
}));

describe("location entity actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    prisma.$transaction.mockImplementation(async (input: unknown) => {
      if (typeof input === "function") {
        return input(prisma);
      }

      return input;
    });
  });

  it("updates built-in location selections for a lobby host", async () => {
    prisma.room.findUnique.mockResolvedValue({
      id: "room-1",
      hostId: "player-1",
      state: "LOBBY",
    });

    const locationActions = await import("./actions");

    await expect(
      locationActions.updateLocationSelections({
        code: "abcde",
        playerId: "player-1",
        locationIds: ["location-1", "location-2"],
      }),
    ).resolves.toEqual({
      success: true,
      data: { count: 2 },
    });

    expect(prisma.room.findUnique).toHaveBeenCalledWith({
      where: { code: "ABCDE" },
    });
    expect(prisma.roomLocation.deleteMany).toHaveBeenCalledWith({
      where: { roomId: "room-1" },
    });
    expect(prisma.roomLocation.createMany).toHaveBeenCalledWith({
      data: [
        { roomId: "room-1", locationId: "location-1" },
        { roomId: "room-1", locationId: "location-2" },
      ],
    });
    expect(domainActionLeak).not.toHaveBeenCalled();
  });

  it("creates and updates custom locations inside the entity layer", async () => {
    prisma.room.findUnique.mockResolvedValue({
      id: "room-1",
      hostId: "player-1",
      state: "LOBBY",
    });
    prisma.customLocation.create.mockResolvedValue({
      id: "custom-1",
      name: "Dead Drop",
      allSpies: false,
      selected: true,
      roles: [
        { id: "role-1", name: "Courier" },
        { id: "role-2", name: "Handler" },
      ],
    });

    const locationActions = await import("./actions");

    await expect(
      locationActions.createCustomLocation({
        code: "ABCDE",
        playerId: "player-1",
        name: "Dead Drop",
        roles: ["Courier", "Handler"],
        allSpies: false,
      }),
    ).resolves.toEqual({
      success: true,
      data: {
        id: "custom-1",
        name: "Dead Drop",
        allSpies: false,
        selected: true,
        roles: [
          { id: "role-1", name: "Courier" },
          { id: "role-2", name: "Handler" },
        ],
      },
    });

    await expect(
      locationActions.updateCustomLocation({
        code: "ABCDE",
        playerId: "player-1",
        locationId: "custom-1",
        name: "Safe House",
        roles: ["Scout", "Lookout"],
        allSpies: true,
        selected: false,
      }),
    ).resolves.toEqual({
      success: true,
      data: { success: true },
    });

    expect(prisma.customLocation.create).toHaveBeenCalledWith({
      data: {
        roomId: "room-1",
        name: "Dead Drop",
        allSpies: false,
        roles: {
          create: [{ name: "Courier" }, { name: "Handler" }],
        },
      },
      include: { roles: true },
    });
    expect(prisma.customLocation.update).toHaveBeenCalledWith({
      where: { id: "custom-1" },
      data: {
        name: "Safe House",
        allSpies: true,
        selected: false,
      },
    });
    expect(prisma.customLocationRole.deleteMany).toHaveBeenCalledWith({
      where: { customLocationId: "custom-1" },
    });
    expect(prisma.customLocationRole.createMany).toHaveBeenCalledWith({
      data: [
        { customLocationId: "custom-1", name: "Scout" },
        { customLocationId: "custom-1", name: "Lookout" },
      ],
    });
    expect(domainActionLeak).not.toHaveBeenCalled();
  });

  it("loads built-in and custom locations for a room", async () => {
    prisma.room.findUnique.mockResolvedValue({
      selectedLocations: [{ locationId: "built-in-2" }],
      customLocations: [
        {
          id: "custom-1",
          name: "Warehouse",
          allSpies: false,
          selected: true,
          roles: [{ id: "role-1", name: "Boss" }],
        },
      ],
    });
    prisma.location.findMany.mockResolvedValue([
      { id: "built-in-1", name: "Embassy", category: "Government" },
      { id: "built-in-2", name: "Train", category: "Transit" },
    ]);

    const locationActions = await import("./actions");

    await expect(locationActions.getLocations("abcde")).resolves.toEqual({
      success: true,
      data: {
        locations: [
          { id: "built-in-1", name: "Embassy", category: "Government", selected: false },
          { id: "built-in-2", name: "Train", category: "Transit", selected: true },
        ],
        customLocations: [
          {
            id: "custom-1",
            name: "Warehouse",
            allSpies: false,
            selected: true,
            roles: [{ id: "role-1", name: "Boss" }],
          },
        ],
      },
    });

    expect(prisma.room.findUnique).toHaveBeenCalledWith({
      where: { code: "ABCDE" },
      include: {
        selectedLocations: { select: { locationId: true } },
        customLocations: {
          include: { roles: { select: { id: true, name: true } } },
        },
      },
    });
    expect(domainActionLeak).not.toHaveBeenCalled();
  });

  it("deletes a custom location for the room host", async () => {
    prisma.room.findUnique.mockResolvedValue({
      id: "room-1",
      hostId: "player-1",
      state: "LOBBY",
    });

    const locationActions = await import("./actions");

    await expect(
      locationActions.deleteCustomLocation({
        code: "ABCDE",
        playerId: "player-1",
        locationId: "custom-1",
      }),
    ).resolves.toEqual({
      success: true,
      data: { success: true },
    });

    expect(prisma.customLocation.delete).toHaveBeenCalledWith({
      where: { id: "custom-1" },
    });
    expect(domainActionLeak).not.toHaveBeenCalled();
  });
});
