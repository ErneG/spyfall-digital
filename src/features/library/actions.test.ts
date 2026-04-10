import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthUser = vi.fn();
const findMany = vi.fn();
const findFirst = vi.fn();
const create = vi.fn();
const update = vi.fn();
const remove = vi.fn();

vi.mock("@/shared/lib/auth-session", () => ({
  getAuthUser,
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    savedLocation: {
      findMany,
      findFirst,
      create,
      update,
      delete: remove,
    },
  },
}));

describe("library actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns saved locations for the authenticated user", async () => {
    getAuthUser.mockResolvedValue({ id: "user-1" });
    findMany.mockResolvedValue([
      {
        id: "saved-1",
        name: "Secret Lab",
        category: "Education & Science",
        allSpies: false,
        updatedAt: new Date("2026-04-10T12:00:00.000Z"),
        roles: [
          { id: "role-1", name: "Scientist" },
          { id: "role-2", name: "Guard" },
        ],
      },
    ]);

    const { getSavedLocations } = await import("./actions");
    const result = await getSavedLocations();

    expect(result).toEqual({
      success: true,
      data: {
        locations: [
          {
            id: "saved-1",
            name: "Secret Lab",
            category: "Education & Science",
            allSpies: false,
            updatedAt: "2026-04-10T12:00:00.000Z",
            roles: [
              { id: "role-1", name: "Scientist" },
              { id: "role-2", name: "Guard" },
            ],
          },
        ],
      },
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: { roles: { orderBy: { order: "asc" } } },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    });
  });

  it("creates a saved location for the authenticated user", async () => {
    getAuthUser.mockResolvedValue({ id: "user-1" });
    create.mockResolvedValue({
      id: "saved-1",
      name: "Secret Lab",
      category: "Education & Science",
      allSpies: false,
      updatedAt: new Date("2026-04-10T12:00:00.000Z"),
      roles: [
        { id: "role-1", name: "Scientist" },
        { id: "role-2", name: "Guard" },
      ],
    });

    const { upsertSavedLocation } = await import("./actions");
    const result = await upsertSavedLocation({
      name: "Secret Lab",
      category: "Education & Science",
      allSpies: false,
      roles: ["Scientist", "Guard"],
    });

    expect(result).toEqual({
      success: true,
      data: {
        id: "saved-1",
        name: "Secret Lab",
        category: "Education & Science",
        allSpies: false,
        updatedAt: "2026-04-10T12:00:00.000Z",
        roles: [
          { id: "role-1", name: "Scientist" },
          { id: "role-2", name: "Guard" },
        ],
      },
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        name: "Secret Lab",
        category: "Education & Science",
        allSpies: false,
        roles: {
          create: [
            { name: "Scientist", order: 0 },
            { name: "Guard", order: 1 },
          ],
        },
      },
      include: { roles: { orderBy: { order: "asc" } } },
    });
  });

  it("updates an existing saved location owned by the authenticated user", async () => {
    getAuthUser.mockResolvedValue({ id: "user-1" });
    findFirst.mockResolvedValue({ id: "saved-1", userId: "user-1" });
    update.mockResolvedValue({
      id: "saved-1",
      name: "Secret Lab",
      category: "Education & Science",
      allSpies: true,
      updatedAt: new Date("2026-04-10T12:00:00.000Z"),
      roles: [],
    });

    const { upsertSavedLocation } = await import("./actions");
    const result = await upsertSavedLocation({
      id: "saved-1",
      name: "Secret Lab",
      category: "Education & Science",
      allSpies: true,
      roles: [],
    });

    expect(result).toEqual({
      success: true,
      data: {
        id: "saved-1",
        name: "Secret Lab",
        category: "Education & Science",
        allSpies: true,
        updatedAt: "2026-04-10T12:00:00.000Z",
        roles: [],
      },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: "saved-1" },
      data: {
        name: "Secret Lab",
        category: "Education & Science",
        allSpies: true,
        roles: {
          deleteMany: {},
          create: [],
        },
      },
      include: { roles: { orderBy: { order: "asc" } } },
    });
  });

  it("rejects delete when the location is not owned by the user", async () => {
    getAuthUser.mockResolvedValue({ id: "user-1" });
    findFirst.mockResolvedValue(null);

    const { deleteSavedLocation } = await import("./actions");
    const result = await deleteSavedLocation({ id: "saved-1" });

    expect(result).toEqual({
      success: false,
      error: "Saved location not found",
    });
    expect(remove).not.toHaveBeenCalled();
  });
});
