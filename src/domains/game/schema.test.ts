import { describe, it, expect } from "vitest";
import {
  startGameInput,
  castVoteInput,
  endGameInput,
  restartGameInput,
  timerToggleInput,
  locationInfoSchema,
  gameViewSchema,
  startGameOutput,
} from "./schema";

// ─── startGameInput ────────────────────────────────────────────

describe("startGameInput", () => {
  it("accepts valid input", () => {
    const result = startGameInput.safeParse({
      roomId: "room-123",
      playerId: "player-456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty roomId", () => {
    const result = startGameInput.safeParse({ roomId: "", playerId: "p1" });
    expect(result.success).toBe(false);
  });

  it("rejects empty playerId", () => {
    const result = startGameInput.safeParse({ roomId: "r1", playerId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(startGameInput.safeParse({}).success).toBe(false);
    expect(startGameInput.safeParse({ roomId: "r1" }).success).toBe(false);
  });
});

// ─── castVoteInput ─────────────────────────────────────────────

describe("castVoteInput", () => {
  it("accepts valid input", () => {
    const result = castVoteInput.safeParse({
      gameId: "g1",
      voterId: "p1",
      suspectId: "p2",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty strings", () => {
    expect(
      castVoteInput.safeParse({ gameId: "", voterId: "p1", suspectId: "p2" })
        .success,
    ).toBe(false);
    expect(
      castVoteInput.safeParse({ gameId: "g1", voterId: "", suspectId: "p2" })
        .success,
    ).toBe(false);
    expect(
      castVoteInput.safeParse({ gameId: "g1", voterId: "p1", suspectId: "" })
        .success,
    ).toBe(false);
  });
});

// ─── endGameInput ──────────────────────────────────────────────

describe("endGameInput", () => {
  it("accepts valid input without spy guess", () => {
    const result = endGameInput.safeParse({
      gameId: "g1",
      playerId: "p1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with spy guess location", () => {
    const result = endGameInput.safeParse({
      gameId: "g1",
      playerId: "p1",
      spyGuessLocationId: "loc-1",
    });
    expect(result.success).toBe(true);
  });

  it("allows spyGuessLocationId to be undefined", () => {
    const result = endGameInput.safeParse({
      gameId: "g1",
      playerId: "p1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.spyGuessLocationId).toBeUndefined();
    }
  });
});

// ─── restartGameInput ──────────────────────────────────────────

describe("restartGameInput", () => {
  it("accepts valid input", () => {
    const result = restartGameInput.safeParse({
      gameId: "g1",
      playerId: "p1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(restartGameInput.safeParse({ gameId: "g1" }).success).toBe(false);
  });
});

// ─── timerToggleInput ──────────────────────────────────────────

describe("timerToggleInput", () => {
  it("accepts pause action", () => {
    const result = timerToggleInput.safeParse({
      gameId: "g1",
      playerId: "p1",
      action: "pause",
    });
    expect(result.success).toBe(true);
  });

  it("accepts resume action", () => {
    const result = timerToggleInput.safeParse({
      gameId: "g1",
      playerId: "p1",
      action: "resume",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid action", () => {
    const result = timerToggleInput.safeParse({
      gameId: "g1",
      playerId: "p1",
      action: "stop",
    });
    expect(result.success).toBe(false);
  });
});

// ─── locationInfoSchema ────────────────────────────────────────

describe("locationInfoSchema", () => {
  it("accepts valid location info", () => {
    const result = locationInfoSchema.safeParse({
      id: "loc-1",
      name: "Hospital",
      imageUrl: "https://example.com/image.png",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null imageUrl", () => {
    const result = locationInfoSchema.safeParse({
      id: "loc-1",
      name: "Hospital",
      imageUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts missing imageUrl", () => {
    const result = locationInfoSchema.safeParse({
      id: "loc-1",
      name: "Hospital",
    });
    expect(result.success).toBe(true);
  });
});

// ─── gameViewSchema ────────────────────────────────────────────

describe("gameViewSchema", () => {
  const validGameView = {
    gameId: "g1",
    phase: "PLAYING",
    myRole: "Doctor",
    isSpy: false,
    location: "Hospital",
    allLocations: [{ id: "loc-1", name: "Hospital" }],
    players: [{ id: "p1", name: "Alice", isHost: true, isOnline: true }],
    timeRemaining: 300,
    timeLimit: 480,
    startedAt: "2026-01-01T00:00:00Z",
    timerRunning: true,
    hideSpyCount: false,
    spyCount: 1,
    prevLocationName: null,
  };

  it("accepts a valid game view", () => {
    const result = gameViewSchema.safeParse(validGameView);
    expect(result.success).toBe(true);
  });

  it("accepts all valid phases", () => {
    for (const phase of ["LOBBY", "PLAYING", "VOTING", "REVEAL", "FINISHED"]) {
      const result = gameViewSchema.safeParse({ ...validGameView, phase });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid phase", () => {
    const result = gameViewSchema.safeParse({
      ...validGameView,
      phase: "UNKNOWN",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional votes and spies in reveal phase", () => {
    const result = gameViewSchema.safeParse({
      ...validGameView,
      phase: "REVEAL",
      votes: [{ voterId: "p1", suspectId: "p2" }],
      spies: ["p2"],
      revealedLocation: "Hospital",
    });
    expect(result.success).toBe(true);
  });
});

// ─── startGameOutput ───────────────────────────────────────────

describe("startGameOutput", () => {
  it("accepts valid output", () => {
    const result = startGameOutput.safeParse({
      gameId: "g1",
      state: "PLAYING",
      startedAt: "2026-01-01T00:00:00Z",
      timerRunning: true,
    });
    expect(result.success).toBe(true);
  });
});
