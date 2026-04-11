import { describe, expect, it } from "vitest";

import {
  collectionContentSourceInput,
  contentSourceInput,
  createBuiltInContentSource,
  createCollectionContentSource,
  getDefaultBuiltInSourceCategories,
  resolveBuiltInContentSourceLocations,
  resolveCollectionContentSourceLocations,
  resolveContentSourceLocations,
} from "./content-source";

describe("contentSourceInput", () => {
  it("defaults built-in sources to every catalog category", () => {
    const result = contentSourceInput.safeParse({
      kind: "built-in",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.kind).toBe("built-in");
    }
    if (result.success && result.data.kind === "built-in") {
      expect(result.data.categories).toEqual(getDefaultBuiltInSourceCategories());
    }
  });

  it("accepts collection-backed sources", () => {
    expect(
      collectionContentSourceInput.parse({
        kind: "collection",
        collectionId: "collection-1",
      }),
    ).toEqual({
      kind: "collection",
      collectionId: "collection-1",
    });
  });
});

describe("createBuiltInContentSource", () => {
  it("falls back to every category when given an empty array", () => {
    expect(createBuiltInContentSource([]).categories).toEqual(getDefaultBuiltInSourceCategories());
  });
});

describe("createCollectionContentSource", () => {
  it("creates a typed collection source", () => {
    expect(createCollectionContentSource("collection-2")).toEqual({
      kind: "collection",
      collectionId: "collection-2",
    });
  });
});

describe("resolveContentSourceLocations", () => {
  it("falls back to the full built-in catalog when categories are empty", () => {
    const locations = resolveBuiltInContentSourceLocations([]);

    expect(locations.length).toBeGreaterThan(10);
  });

  it("filters the built-in catalog by category", () => {
    const locations = resolveContentSourceLocations(createBuiltInContentSource(["Transportation"]));

    expect(locations.length).toBeGreaterThan(0);
    expect(locations.every((location) => location.category === "Transportation")).toBe(true);
  });

  it("labels collection-backed locations with the collection name", () => {
    expect(
      resolveCollectionContentSourceLocations({
        name: "Night Shift",
        locations: [
          {
            allSpies: false,
            name: "Secret Lab",
            roles: [{ name: "Scientist" }, { name: "Guard" }],
          },
          {
            allSpies: true,
            name: "Dead Drop",
            roles: [],
          },
        ],
      }),
    ).toEqual([
      {
        allSpies: false,
        category: "Night Shift",
        name: "Secret Lab",
        roles: ["Scientist", "Guard"],
      },
      {
        allSpies: true,
        category: "Night Shift",
        name: "Dead Drop",
        roles: [],
      },
    ]);
  });

  it("maps collection roles into a shared location shape", () => {
    expect(
      resolveContentSourceLocations(createCollectionContentSource("collection-1"), {
        collection: {
          name: "Custom Pack",
          locations: [
            {
              allSpies: false,
              name: "Secret Lab",
              roles: [{ name: "Scientist" }, { name: "Guard" }],
            },
          ],
        },
      }),
    ).toEqual([
      {
        allSpies: false,
        category: "Custom Pack",
        name: "Secret Lab",
        roles: ["Scientist", "Guard"],
      },
    ]);
  });

  it("returns an empty list when a collection source has no loaded collection detail", () => {
    expect(resolveContentSourceLocations(createCollectionContentSource("collection-1"))).toEqual(
      [],
    );
  });
});
