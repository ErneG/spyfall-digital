import { describe, expect, it } from "vitest";

import { createPassAndPlayInput } from "./schema";

describe("room entity schema exports", () => {
  it("keeps pass-and-play defaults available through the entity layer", () => {
    const parsed = createPassAndPlayInput.parse({
      players: {
        names: ["Nova", "Orion", "Piper"],
      },
    });

    expect(parsed).toMatchObject({
      players: {
        names: ["Nova", "Orion", "Piper"],
      },
      settings: {
        timeLimit: 480,
        spyCount: 1,
        hideSpyCount: false,
      },
      source: {
        kind: "built-in",
      },
    });
    expect(parsed.source.kind).toBe("built-in");
    if (parsed.source.kind !== "built-in") {
      throw new Error("Expected built-in pass-and-play source");
    }
    expect(parsed.source.categories).toContain("Transportation");
  });
});
