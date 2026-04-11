import { describe, expect, it } from "vitest";

import { addLocationInput, createCollectionInput, importCollectionInput } from "./collection";

describe("collection entity schemas", () => {
  it("requires a collection name when creating a collection", () => {
    expect(createCollectionInput.safeParse({ name: "" }).success).toBe(false);
  });

  it("requires at least one role when adding a collection-only location", () => {
    expect(
      addLocationInput.safeParse({
        collectionId: "collection-1",
        name: "Secret Lab",
        roles: [],
      }).success,
    ).toBe(false);
  });

  it("requires a room code when importing a collection into a room", () => {
    expect(
      importCollectionInput.safeParse({
        collectionId: "collection-1",
        roomCode: "",
        playerId: "player-1",
      }).success,
    ).toBe(false);
  });
});
