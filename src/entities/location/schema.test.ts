import { describe, expect, it } from "vitest";

import {
  createCustomLocationInput,
  customLocationSchema,
  deleteCustomLocationInput,
  locationItemSchema,
  locationsResponseSchema,
  updateCustomLocationInput,
  updateLocationsInput,
} from "./schema";

describe("location entity schema", () => {
  it("parses location payloads and mutation inputs through the entity layer", () => {
    expect(
      locationItemSchema.parse({
        id: "built-in-1",
        name: "Terminal",
        category: "Transit",
        selected: true,
      }),
    ).toEqual({
      id: "built-in-1",
      name: "Terminal",
      category: "Transit",
      selected: true,
    });

    expect(
      customLocationSchema.parse({
        id: "custom-1",
        name: "Warehouse",
        allSpies: false,
        selected: true,
        roles: [
          { id: "role-1", name: "Boss" },
          { id: "role-2", name: "Courier" },
        ],
      }),
    ).toMatchObject({
      id: "custom-1",
      name: "Warehouse",
      roles: [{ name: "Boss" }, { name: "Courier" }],
    });

    expect(
      locationsResponseSchema.parse({
        locations: [{ id: "built-in-1", name: "Terminal", category: "Transit", selected: true }],
        customLocations: [],
      }),
    ).toEqual({
      locations: [{ id: "built-in-1", name: "Terminal", category: "Transit", selected: true }],
      customLocations: [],
    });

    expect(
      updateLocationsInput.parse({ playerId: "player-1", locationIds: ["built-in-1"] }),
    ).toEqual({
      playerId: "player-1",
      locationIds: ["built-in-1"],
    });
    expect(createCustomLocationInput.parse({ playerId: "player-1" })).toMatchObject({
      playerId: "player-1",
      name: "New Location",
      roles: ["Role 1", "Role 2", "Role 3"],
      allSpies: false,
    });
    expect(
      updateCustomLocationInput.parse({
        playerId: "player-1",
        locationId: "custom-1",
        name: "Warehouse",
        roles: ["Boss", "Courier"],
        selected: true,
      }),
    ).toMatchObject({
      playerId: "player-1",
      locationId: "custom-1",
      selected: true,
    });
    expect(
      deleteCustomLocationInput.parse({ playerId: "player-1", locationId: "custom-1" }),
    ).toEqual({
      playerId: "player-1",
      locationId: "custom-1",
    });
  });
});
