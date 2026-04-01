import { describe, it, expect } from "vitest";

import {
  createRoomInput,
  joinRoomInput,
  updateRoomConfigInput,
  roomEventSchema,
  createPassAndPlayInput,
} from "./schema";

// ─── createRoomInput ───────────────────────────────────────────

describe("createRoomInput", () => {
  it("accepts valid input with defaults", () => {
    const result = createRoomInput.safeParse({ hostName: "Alice" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timeLimit).toBe(480);
      expect(result.data.spyCount).toBe(1);
    }
  });

  it("accepts valid input with overrides", () => {
    const result = createRoomInput.safeParse({
      hostName: "Bob",
      timeLimit: 600,
      spyCount: 2,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timeLimit).toBe(600);
      expect(result.data.spyCount).toBe(2);
    }
  });

  it("rejects empty hostName", () => {
    const result = createRoomInput.safeParse({ hostName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects hostName longer than 20 chars", () => {
    const result = createRoomInput.safeParse({
      hostName: "A".repeat(21),
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from hostName", () => {
    const result = createRoomInput.safeParse({ hostName: "  Alice  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hostName).toBe("Alice");
    }
  });

  it("rejects timeLimit below 360", () => {
    const result = createRoomInput.safeParse({
      hostName: "Alice",
      timeLimit: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects timeLimit above 600", () => {
    const result = createRoomInput.safeParse({
      hostName: "Alice",
      timeLimit: 700,
    });
    expect(result.success).toBe(false);
  });

  it("rejects spyCount below 1", () => {
    const result = createRoomInput.safeParse({
      hostName: "Alice",
      spyCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects spyCount above 2", () => {
    const result = createRoomInput.safeParse({
      hostName: "Alice",
      spyCount: 3,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer timeLimit", () => {
    const result = createRoomInput.safeParse({
      hostName: "Alice",
      timeLimit: 480.5,
    });
    expect(result.success).toBe(false);
  });
});

// ─── joinRoomInput ─────────────────────────────────────────────

describe("joinRoomInput", () => {
  it("accepts valid input", () => {
    const result = joinRoomInput.safeParse({
      playerName: "Bob",
      roomCode: "ABCDE",
    });
    expect(result.success).toBe(true);
  });

  it("uppercases room code", () => {
    const result = joinRoomInput.safeParse({
      playerName: "Bob",
      roomCode: "abcde",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.roomCode).toBe("ABCDE");
    }
  });

  it("rejects room code that is not 5 chars", () => {
    expect(joinRoomInput.safeParse({ playerName: "Bob", roomCode: "ABC" }).success).toBe(false);
    expect(joinRoomInput.safeParse({ playerName: "Bob", roomCode: "ABCDEF" }).success).toBe(false);
  });

  it("rejects empty playerName", () => {
    const result = joinRoomInput.safeParse({
      playerName: "",
      roomCode: "ABCDE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects playerName longer than 20 chars", () => {
    const result = joinRoomInput.safeParse({
      playerName: "B".repeat(21),
      roomCode: "ABCDE",
    });
    expect(result.success).toBe(false);
  });
});

// ─── updateRoomConfigInput ─────────────────────────────────────

describe("updateRoomConfigInput", () => {
  it("accepts minimal input (roomCode + playerId only)", () => {
    const result = updateRoomConfigInput.safeParse({ roomCode: "ABCDE", playerId: "p1" });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = updateRoomConfigInput.safeParse({
      roomCode: "ABCDE",
      playerId: "p1",
      timeLimit: 420,
      spyCount: 2,
      autoStartTimer: true,
      hideSpyCount: true,
      moderatorMode: false,
      moderatorLocationId: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty playerId", () => {
    const result = updateRoomConfigInput.safeParse({ roomCode: "ABCDE", playerId: "" });
    expect(result.success).toBe(false);
  });
});

// ─── roomEventSchema ───────────────────────────────────────────

describe("roomEventSchema", () => {
  const validEvent = {
    state: "LOBBY",
    players: [{ id: "p1", name: "Alice", isHost: true, isOnline: true }],
    timeLimit: 480,
    spyCount: 1,
    autoStartTimer: true,
    hideSpyCount: false,
    moderatorMode: false,
    moderatorLocationId: null,
    selectedLocationCount: 28,
    totalLocationCount: 54,
    currentGameId: null,
    gameStartedAt: null,
    timerRunning: false,
  };

  it("accepts a valid room event", () => {
    expect(roomEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it("accepts event with error field", () => {
    const result = roomEventSchema.safeParse({
      ...validEvent,
      error: "Something went wrong",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid state", () => {
    const result = roomEventSchema.safeParse({
      ...validEvent,
      state: "INVALID",
    });
    expect(result.success).toBe(false);
  });
});

// ─── createPassAndPlayInput ────────────────────────────────────

describe("createPassAndPlayInput", () => {
  it("accepts valid input with defaults", () => {
    const result = createPassAndPlayInput.safeParse({
      playerNames: ["Alice", "Bob", "Charlie"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timeLimit).toBe(480);
      expect(result.data.spyCount).toBe(1);
      expect(result.data.hideSpyCount).toBe(false);
    }
  });

  it("rejects fewer than 3 players", () => {
    const result = createPassAndPlayInput.safeParse({
      playerNames: ["Alice", "Bob"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 12 players", () => {
    const names = Array.from({ length: 13 }, (_, i) => `Player${i + 1}`);
    const result = createPassAndPlayInput.safeParse({ playerNames: names });
    expect(result.success).toBe(false);
  });

  it("rejects empty player names", () => {
    const result = createPassAndPlayInput.safeParse({
      playerNames: ["Alice", "", "Charlie"],
    });
    expect(result.success).toBe(false);
  });

  it("trims player names", () => {
    const result = createPassAndPlayInput.safeParse({
      playerNames: ["  Alice  ", "Bob", "Charlie"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.playerNames[0]).toBe("Alice");
    }
  });
});
