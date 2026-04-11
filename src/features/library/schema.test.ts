import { describe, expect, it } from "vitest";

import {
  savedLocationItemSchema,
  upsertSavedLocationInput,
  savedLocationsResponseSchema,
} from "./schema";

describe("savedLocationItemSchema", () => {
  it("accepts a valid saved location", () => {
    const result = savedLocationItemSchema.safeParse({
      id: "saved-1",
      name: "Secret Lab",
      category: "Education & Science",
      allSpies: false,
      roles: [
        { id: "role-1", name: "Scientist" },
        { id: "role-2", name: "Security Guard" },
      ],
      updatedAt: "2026-04-10T10:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });
});

describe("savedLocationsResponseSchema", () => {
  it("accepts an empty saved location list", () => {
    const result = savedLocationsResponseSchema.safeParse({ locations: [] });

    expect(result.success).toBe(true);
  });
});

describe("upsertSavedLocationInput", () => {
  it("normalizes trimmed role names for a standard location", () => {
    const result = upsertSavedLocationInput.safeParse({
      name: "  Secret Lab  ",
      category: "Education & Science",
      allSpies: false,
      roles: [" Scientist ", " ", "Security Guard"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Secret Lab");
      expect(result.data.roles).toEqual(["Scientist", "Security Guard"]);
    }
  });

  it("allows all-spies locations with no roles", () => {
    const result = upsertSavedLocationInput.safeParse({
      name: "Double Agent Summit",
      category: "Nightlife & Events",
      allSpies: true,
      roles: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a non-all-spies location when every role is blank after normalization", () => {
    const result = upsertSavedLocationInput.safeParse({
      name: "Blank Roles",
      category: "Workplace",
      allSpies: false,
      roles: [" ", "   "],
    });

    expect(result.success).toBe(false);
  });
});
