import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthUser, prisma } = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  prisma: {
    locationCollection: {
      count: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    nameHistory: {
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/domains/profile/actions", () => {
  throw new Error("entities/profile/actions should not import @/domains/profile/actions");
});

vi.mock("@/shared/lib/auth-session", () => ({
  getAuthUser,
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma,
}));

describe("profile entity actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getAuthUser.mockResolvedValue({
      id: "user-1",
      name: "Nova",
      email: "nova@example.com",
      image: null,
      displayName: "Agent Nova",
    });
  });

  it("loads the signed-in profile through the entity layer", async () => {
    prisma.locationCollection.count.mockResolvedValue(3);

    const profileActions = await import("./actions");

    await expect(profileActions.getProfile()).resolves.toEqual({
      success: true,
      data: {
        id: "user-1",
        name: "Nova",
        email: "nova@example.com",
        displayName: "Agent Nova",
        image: null,
        collectionCount: 3,
      },
    });

    expect(prisma.locationCollection.count).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("updates the current user's display name", async () => {
    const profileActions = await import("./actions");

    await expect(profileActions.updateProfile({ displayName: "Midnight" })).resolves.toEqual({
      success: true,
      data: { displayName: "Midnight" },
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { displayName: "Midnight" },
    });
  });

  it("returns recent name history and suggestions", async () => {
    prisma.nameHistory.findMany
      .mockResolvedValueOnce([
        { id: "name-1", name: "Nova", usedAt: new Date("2026-04-11T10:00:00.000Z") },
      ])
      .mockResolvedValueOnce([{ name: "Nova" }, { name: "Midnight" }]);

    const profileActions = await import("./actions");

    await expect(profileActions.getNameHistory()).resolves.toEqual({
      success: true,
      data: [{ id: "name-1", name: "Nova", usedAt: "2026-04-11T10:00:00.000Z" }],
    });
    await expect(profileActions.getNameSuggestions()).resolves.toEqual({
      success: true,
      data: ["Nova", "Midnight"],
    });

    expect(prisma.nameHistory.findMany).toHaveBeenNthCalledWith(1, {
      where: { userId: "user-1" },
      orderBy: { usedAt: "desc" },
      take: 20,
    });
    expect(prisma.nameHistory.findMany).toHaveBeenNthCalledWith(2, {
      where: { userId: "user-1" },
      orderBy: { usedAt: "desc" },
      take: 5,
      select: { name: true },
    });
  });

  it("deletes a saved name for the signed-in user", async () => {
    const profileActions = await import("./actions");

    await expect(profileActions.deleteNameFromHistory({ name: "Nova" })).resolves.toEqual({
      success: true,
      data: { deleted: true },
    });

    expect(prisma.nameHistory.delete).toHaveBeenCalledWith({
      where: { userId_name: { userId: "user-1", name: "Nova" } },
    });
  });
});
