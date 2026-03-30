import { describe, it, expect } from "vitest";
import {
  locationItemSchema,
  customLocationSchema,
  locationsResponseSchema,
  updateLocationsInput,
  createCustomLocationInput,
  updateCustomLocationInput,
  deleteCustomLocationInput,
  locationSeedSchema,
} from "./schema";

// ─── locationItemSchema ────────────────────────────────────────

describe("locationItemSchema", () => {
  it("accepts a valid location item", () => {
    const result = locationItemSchema.safeParse({
      id: "loc-1",
      name: "Hospital",
      edition: 1,
      selected: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts without optional edition", () => {
    const result = locationItemSchema.safeParse({
      id: "loc-1",
      name: "Hospital",
      selected: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(locationItemSchema.safeParse({ id: "loc-1" }).success).toBe(false);
    expect(
      locationItemSchema.safeParse({ id: "loc-1", name: "Hospital" }).success,
    ).toBe(false);
  });
});

// ─── customLocationSchema ──────────────────────────────────────

describe("customLocationSchema", () => {
  it("accepts a valid custom location", () => {
    const result = customLocationSchema.safeParse({
      id: "custom-1",
      name: "My Location",
      allSpies: false,
      selected: true,
      roles: [
        { id: "r1", name: "Role A" },
        { id: "r2", name: "Role B" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts custom location with empty roles", () => {
    const result = customLocationSchema.safeParse({
      id: "custom-1",
      name: "My Location",
      allSpies: true,
      selected: false,
      roles: [],
    });
    expect(result.success).toBe(true);
  });
});

// ─── locationsResponseSchema ───────────────────────────────────

describe("locationsResponseSchema", () => {
  it("accepts a valid response", () => {
    const result = locationsResponseSchema.safeParse({
      locations: [{ id: "loc-1", name: "Hospital", selected: true }],
      customLocations: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty arrays", () => {
    const result = locationsResponseSchema.safeParse({
      locations: [],
      customLocations: [],
    });
    expect(result.success).toBe(true);
  });
});

// ─── updateLocationsInput ──────────────────────────────────────

describe("updateLocationsInput", () => {
  it("accepts valid input", () => {
    const result = updateLocationsInput.safeParse({
      playerId: "p1",
      locationIds: ["loc-1", "loc-2"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty playerId", () => {
    const result = updateLocationsInput.safeParse({
      playerId: "",
      locationIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty locationIds array", () => {
    const result = updateLocationsInput.safeParse({
      playerId: "p1",
      locationIds: [],
    });
    expect(result.success).toBe(true);
  });
});

// ─── createCustomLocationInput ─────────────────────────────────

describe("createCustomLocationInput", () => {
  it("accepts valid input with defaults", () => {
    const result = createCustomLocationInput.safeParse({ playerId: "p1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("New Location");
      expect(result.data.roles).toEqual(["Role 1", "Role 2", "Role 3"]);
      expect(result.data.allSpies).toBe(false);
    }
  });

  it("accepts custom values", () => {
    const result = createCustomLocationInput.safeParse({
      playerId: "p1",
      name: "My Place",
      roles: ["Guard", "Visitor"],
      allSpies: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Place");
    }
  });

  it("rejects name longer than 50 chars", () => {
    const result = createCustomLocationInput.safeParse({
      playerId: "p1",
      name: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createCustomLocationInput.safeParse({
      playerId: "p1",
      name: "",
    });
    expect(result.success).toBe(false);
  });
});

// ─── updateCustomLocationInput ─────────────────────────────────

describe("updateCustomLocationInput", () => {
  it("accepts minimal input", () => {
    const result = updateCustomLocationInput.safeParse({
      playerId: "p1",
      locationId: "loc-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = updateCustomLocationInput.safeParse({
      playerId: "p1",
      locationId: "loc-1",
      name: "Updated Name",
      roles: ["New Role"],
      allSpies: true,
      selected: false,
    });
    expect(result.success).toBe(true);
  });
});

// ─── deleteCustomLocationInput ─────────────────────────────────

describe("deleteCustomLocationInput", () => {
  it("accepts valid input", () => {
    const result = deleteCustomLocationInput.safeParse({
      playerId: "p1",
      locationId: "loc-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty fields", () => {
    expect(
      deleteCustomLocationInput.safeParse({ playerId: "", locationId: "loc-1" })
        .success,
    ).toBe(false);
    expect(
      deleteCustomLocationInput.safeParse({ playerId: "p1", locationId: "" })
        .success,
    ).toBe(false);
  });
});

// ─── locationSeedSchema ────────────────────────────────────────

describe("locationSeedSchema", () => {
  it("accepts valid seed data", () => {
    const result = locationSeedSchema.safeParse({
      name: "Hospital",
      edition: 1,
      roles: ["Doctor", "Nurse", "Patient"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing roles", () => {
    const result = locationSeedSchema.safeParse({
      name: "Hospital",
      edition: 1,
    });
    expect(result.success).toBe(false);
  });
});
