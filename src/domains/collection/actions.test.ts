import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthUser = vi.fn();
const locationCollectionFindFirst = vi.fn();
const collectionLocationCreate = vi.fn();
const savedLocationFindMany = vi.fn();
const savedLocationFindFirst = vi.fn();

vi.mock("@/shared/lib/auth-session", () => ({
  getAuthUser,
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    locationCollection: {
      findFirst: locationCollectionFindFirst,
    },
    collectionLocation: {
      create: collectionLocationCreate,
    },
    savedLocation: {
      findMany: savedLocationFindMany,
      findFirst: savedLocationFindFirst,
    },
  },
}));

describe("collection saved-location integration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("loads saved locations that can be imported into collections", async () => {
    getAuthUser.mockResolvedValue({ id: "user-1" });
    savedLocationFindMany.mockResolvedValue([
      {
        id: "saved-1",
        name: "Secret Lab",
        category: "Education & Science",
        allSpies: false,
        roles: [
          { id: "role-1", name: "Scientist" },
          { id: "role-2", name: "Guard" },
        ],
      },
    ]);

    const { getSavedLocationImports } = await import("./actions");
    const result = await getSavedLocationImports();

    expect(result).toEqual({
      success: true,
      data: [
        {
          id: "saved-1",
          name: "Secret Lab",
          category: "Education & Science",
          allSpies: false,
          roles: [
            { id: "role-1", name: "Scientist" },
            { id: "role-2", name: "Guard" },
          ],
        },
      ],
    });
    expect(savedLocationFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: { roles: { orderBy: { order: "asc" } } },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    });
  });

  it("imports a saved location into a collection owned by the user", async () => {
    getAuthUser.mockResolvedValue({ id: "user-1" });
    locationCollectionFindFirst.mockResolvedValue({ id: "collection-1", userId: "user-1" });
    savedLocationFindFirst.mockResolvedValue({
      id: "saved-1",
      userId: "user-1",
      name: "Secret Lab",
      allSpies: false,
      roles: [
        { id: "role-1", name: "Scientist" },
        { id: "role-2", name: "Guard" },
      ],
    });
    collectionLocationCreate.mockResolvedValue({
      id: "collection-location-1",
      name: "Secret Lab",
      allSpies: false,
      roles: [
        { id: "imported-role-1", name: "Scientist" },
        { id: "imported-role-2", name: "Guard" },
      ],
    });

    const { importSavedLocationToCollection } = await import("./actions");
    const result = await importSavedLocationToCollection({
      collectionId: "collection-1",
      savedLocationId: "saved-1",
    });

    expect(result).toEqual({
      success: true,
      data: {
        id: "collection-location-1",
        name: "Secret Lab",
        allSpies: false,
        roles: [
          { id: "imported-role-1", name: "Scientist" },
          { id: "imported-role-2", name: "Guard" },
        ],
      },
    });
    expect(collectionLocationCreate).toHaveBeenCalledWith({
      data: {
        collectionId: "collection-1",
        name: "Secret Lab",
        allSpies: false,
        roles: {
          create: [{ name: "Scientist" }, { name: "Guard" }],
        },
      },
      include: { roles: true },
    });
  });
});
