import { describe, expect, it, vi } from "vitest";

const getLocations = vi.fn();

vi.mock("@/entities/location/actions", () => ({
  getLocations,
}));

describe("entities/location/query", () => {
  it("fetches room locations through the entity action layer", async () => {
    const payload = {
      locations: [{ id: "built-in-1", name: "Terminal", category: "Transit", selected: true }],
      customLocations: [],
    };
    getLocations.mockResolvedValue({ success: true, data: payload });

    const { fetchLocations, locationKeys } = await import("./query");

    await expect(fetchLocations("ABCDE")).resolves.toEqual(payload);
    expect(getLocations).toHaveBeenCalledWith("ABCDE");
    expect(locationKeys.forRoom("ABCDE")).toEqual(["locations", "ABCDE"]);
  });
});
