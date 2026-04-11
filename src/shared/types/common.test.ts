import { describe, it, expect } from "vitest";

import { gamePhaseSchema, playerSchema } from "./common";

describe("gamePhaseSchema", () => {
  it("accepts all valid phases", () => {
    for (const phase of ["LOBBY", "PLAYING", "VOTING", "REVEAL", "FINISHED"]) {
      expect(gamePhaseSchema.safeParse(phase).success).toBe(true);
    }
  });

  it("rejects invalid phase", () => {
    expect(gamePhaseSchema.safeParse("WAITING").success).toBe(false);
    expect(gamePhaseSchema.safeParse("").success).toBe(false);
    expect(gamePhaseSchema.safeParse(123).success).toBe(false);
  });
});

describe("playerSchema", () => {
  it("accepts a valid player", () => {
    const result = playerSchema.safeParse({
      id: "p1",
      name: "Alice",
      isHost: true,
      isOnline: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts player with optional moderatorRole", () => {
    const result = playerSchema.safeParse({
      id: "p1",
      name: "Alice",
      isHost: false,
      isOnline: true,
      moderatorRole: "Doctor",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null moderatorRole", () => {
    const result = playerSchema.safeParse({
      id: "p1",
      name: "Alice",
      isHost: false,
      isOnline: true,
      moderatorRole: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(playerSchema.safeParse({ id: "p1" }).success).toBe(false);
    expect(playerSchema.safeParse({ id: "p1", name: "Alice" }).success).toBe(false);
  });
});
