import { describe, expect, it, vi } from "vitest";

const fetchLocationsMock = vi.fn();

vi.mock("@/domains/location/hooks", () => ({
  fetchLocations: fetchLocationsMock,
  locationKeys: {
    all: ["locations"],
    forRoom: (roomCode: string) => ["locations", roomCode],
  },
}));

describe("entities/location/query", () => {
  it("re-exports the room location query helpers through the entity layer", async () => {
    const payload = {
      locations: [{ id: "built-in-1", name: "Terminal", category: "Transit", selected: true }],
      customLocations: [],
    };
    fetchLocationsMock.mockResolvedValue(payload);

    const { fetchLocations, locationKeys } = await import("./query");

    await expect(fetchLocations("ABCDE")).resolves.toEqual(payload);
    expect(locationKeys.forRoom("ABCDE")).toEqual(["locations", "ABCDE"]);
  });
});
