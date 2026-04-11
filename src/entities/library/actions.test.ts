import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthUser, prisma } = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  prisma: {
    locationCollection: {
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    collectionLocation: {
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    savedLocation: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/shared/lib/auth-session", () => ({
  getAuthUser,
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma,
}));

describe("library entity actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getAuthUser.mockResolvedValue({
      id: "user-1",
      name: "Nova",
      email: "nova@example.com",
    });
  });

  it("lists the signed-in user's collections", async () => {
    prisma.locationCollection.findMany.mockResolvedValue([
      {
        id: "collection-1",
        name: "Favorites",
        description: "Trusted drops",
        createdAt: new Date("2026-04-11T08:00:00.000Z"),
        _count: { locations: 2 },
      },
    ]);

    const libraryActions = await import("./actions");
    const result = await libraryActions.getCollections();

    expect(result).toEqual({
      success: true,
      data: [
        {
          id: "collection-1",
          name: "Favorites",
          description: "Trusted drops",
          locationCount: 2,
          createdAt: "2026-04-11T08:00:00.000Z",
        },
      ],
    });
    expect(prisma.locationCollection.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: { _count: { select: { locations: true } } },
      orderBy: { updatedAt: "desc" },
    });
  });

  it("creates and updates a collection inside the entity layer", async () => {
    prisma.locationCollection.create.mockResolvedValue({ id: "collection-1" });
    prisma.locationCollection.findFirst.mockResolvedValue({
      id: "collection-1",
      userId: "user-1",
    });
    prisma.locationCollection.update.mockResolvedValue({});

    const libraryActions = await import("./actions");

    await expect(
      libraryActions.createCollection({ name: "Favorites", description: "Trusted drops" }),
    ).resolves.toEqual({
      success: true,
      data: { id: "collection-1" },
    });
    await expect(
      libraryActions.updateCollection({
        id: "collection-1",
        name: "Updated Favorites",
      }),
    ).resolves.toEqual({
      success: true,
      data: { updated: true },
    });

    expect(prisma.locationCollection.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        name: "Favorites",
        description: "Trusted drops",
      },
    });
    expect(prisma.locationCollection.update).toHaveBeenCalledWith({
      where: { id: "collection-1" },
      data: { name: "Updated Favorites" },
    });
  });

  it("adds locations and imports saved locations into collections", async () => {
    prisma.locationCollection.findFirst
      .mockResolvedValueOnce({ id: "collection-1", userId: "user-1" })
      .mockResolvedValueOnce({ id: "collection-1", userId: "user-1" });
    prisma.collectionLocation.create
      .mockResolvedValueOnce({
        id: "location-1",
        name: "Dead Drop",
        allSpies: false,
        roles: [{ id: "role-1", name: "Courier" }],
      })
      .mockResolvedValueOnce({
        id: "location-2",
        name: "Safe House",
        allSpies: true,
        roles: [{ id: "role-2", name: "Lookout" }],
      });
    prisma.savedLocation.findFirst.mockResolvedValue({
      id: "saved-1",
      name: "Safe House",
      allSpies: true,
      roles: [{ id: "saved-role-1", name: "Lookout", order: 0 }],
    });

    const libraryActions = await import("./actions");

    await expect(
      libraryActions.addLocationToCollection({
        collectionId: "collection-1",
        name: "Dead Drop",
        roles: ["Courier"],
      }),
    ).resolves.toEqual({
      success: true,
      data: {
        id: "location-1",
        name: "Dead Drop",
        allSpies: false,
        roles: [{ id: "role-1", name: "Courier" }],
      },
    });
    await expect(
      libraryActions.importSavedLocationToCollection({
        collectionId: "collection-1",
        savedLocationId: "saved-1",
      }),
    ).resolves.toEqual({
      success: true,
      data: {
        id: "location-2",
        name: "Safe House",
        allSpies: true,
        roles: [{ id: "role-2", name: "Lookout" }],
      },
    });
  });

  it("returns saved-location imports for the current user", async () => {
    prisma.savedLocation.findMany.mockResolvedValue([
      {
        id: "saved-1",
        name: "Dead Drop",
        category: "Urban",
        allSpies: false,
        roles: [{ id: "role-1", name: "Courier" }],
      },
    ]);

    const libraryActions = await import("./actions");
    const result = await libraryActions.getSavedLocationImports();

    expect(result).toEqual({
      success: true,
      data: [
        {
          id: "saved-1",
          name: "Dead Drop",
          category: "Urban",
          allSpies: false,
          roles: [{ id: "role-1", name: "Courier" }],
        },
      ],
    });
    expect(prisma.savedLocation.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: { roles: { orderBy: { order: "asc" } } },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    });
  });
});
