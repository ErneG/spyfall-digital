import { describe, expect, it } from "vitest";

import { deleteNameInput, nameHistoryItem, profileOutput, updateProfileInput } from "./schema";

describe("profile entity schema exports", () => {
  it("parses profile payloads through the entity layer", () => {
    expect(
      profileOutput.parse({
        id: "user-1",
        name: "Nova",
        email: "nova@example.com",
        displayName: "Nova",
        image: null,
        collectionCount: 4,
      }),
    ).toEqual({
      id: "user-1",
      name: "Nova",
      email: "nova@example.com",
      displayName: "Nova",
      image: null,
      collectionCount: 4,
    });
  });

  it("keeps profile mutation schemas available through the entity layer", () => {
    expect(updateProfileInput.parse({ displayName: "Nova" })).toEqual({
      displayName: "Nova",
    });
    expect(
      nameHistoryItem.parse({ id: "name-1", name: "Nova", usedAt: "2026-04-11T10:00:00Z" }),
    ).toEqual({
      id: "name-1",
      name: "Nova",
      usedAt: "2026-04-11T10:00:00Z",
    });
    expect(deleteNameInput.parse({ name: "Nova" })).toEqual({ name: "Nova" });
  });
});
