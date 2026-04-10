import { describe, expect, it } from "vitest";

import {
  collectionContentSourceInput,
  contentSourceInput,
  createBuiltInContentSource,
  createCollectionContentSource,
  getDefaultBuiltInSourceCategories,
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
