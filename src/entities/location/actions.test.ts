import { beforeEach, describe, expect, it, vi } from "vitest";

const createCustomLocation = vi.fn();
const deleteCustomLocation = vi.fn();
const getLocations = vi.fn();
const updateCustomLocation = vi.fn();
const updateLocationSelections = vi.fn();

vi.mock("@/domains/location/actions", () => ({
  createCustomLocation,
  deleteCustomLocation,
  getLocations,
  updateCustomLocation,
  updateLocationSelections,
}));

describe("location entity actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("delegates room location actions through the entity layer", async () => {
    createCustomLocation.mockResolvedValue({ success: true, data: { id: "custom-1" } });
    deleteCustomLocation.mockResolvedValue({ success: true, data: { success: true } });
    getLocations.mockResolvedValue({ success: true, data: { locations: [], customLocations: [] } });
    updateCustomLocation.mockResolvedValue({ success: true, data: { success: true } });
    updateLocationSelections.mockResolvedValue({ success: true, data: { count: 3 } });

    const locationActions = await import("./actions");

    await expect(
      locationActions.updateLocationSelections({
        code: "ABCDE",
        playerId: "player-1",
        locationIds: ["location-1"],
      }),
    ).resolves.toEqual({ success: true, data: { count: 3 } });
    await expect(
      locationActions.createCustomLocation({
        code: "ABCDE",
        playerId: "player-1",
        name: "Dead Drop",
        roles: ["Courier"],
        allSpies: false,
      }),
    ).resolves.toEqual({ success: true, data: { id: "custom-1" } });
    await expect(
      locationActions.updateCustomLocation({
        code: "ABCDE",
        playerId: "player-1",
        locationId: "custom-1",
        selected: true,
      }),
    ).resolves.toEqual({ success: true, data: { success: true } });
    await expect(locationActions.getLocations("ABCDE")).resolves.toEqual({
      success: true,
      data: { locations: [], customLocations: [] },
    });
    await expect(
      locationActions.deleteCustomLocation({
        code: "ABCDE",
        playerId: "player-1",
        locationId: "custom-1",
      }),
    ).resolves.toEqual({ success: true, data: { success: true } });
  });
});
