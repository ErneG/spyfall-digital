import { beforeEach, describe, expect, it, vi } from "vitest";

const getProfile = vi.fn();
const getNameHistory = vi.fn();
const updateProfile = vi.fn();
const deleteNameFromHistory = vi.fn();
const getNameSuggestions = vi.fn();

vi.mock("@/domains/profile/actions", () => ({
  deleteNameFromHistory,
  getNameHistory,
  getNameSuggestions,
  getProfile,
  updateProfile,
}));

describe("profile entity action wrappers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("re-exports profile reads and mutations through the entity layer", async () => {
    getProfile.mockResolvedValue({ success: true, data: { id: "user-1" } });
    getNameHistory.mockResolvedValue({ success: true, data: [] });
    updateProfile.mockResolvedValue({ success: true, data: { displayName: "Nova" } });
    deleteNameFromHistory.mockResolvedValue({ success: true, data: { deleted: true } });
    getNameSuggestions.mockResolvedValue({ success: true, data: ["Nova"] });

    const profileActions = await import("./actions");

    await expect(profileActions.getProfile()).resolves.toEqual({
      success: true,
      data: { id: "user-1" },
    });
    await expect(profileActions.getNameHistory()).resolves.toEqual({
      success: true,
      data: [],
    });
    await expect(profileActions.updateProfile({ displayName: "Nova" })).resolves.toEqual({
      success: true,
      data: { displayName: "Nova" },
    });
    await expect(profileActions.deleteNameFromHistory({ name: "Nova" })).resolves.toEqual({
      success: true,
      data: { deleted: true },
    });
    await expect(profileActions.getNameSuggestions()).resolves.toEqual({
      success: true,
      data: ["Nova"],
    });
  });
});
