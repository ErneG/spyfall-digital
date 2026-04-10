import { beforeEach, describe, expect, it, vi } from "vitest";

const createPassAndPlayRoom = vi.fn();
const startGame = vi.fn();

vi.mock("@/entities/room/pass-and-play", () => ({
  createPassAndPlayRoom,
}));

vi.mock("@/entities/game/actions", () => ({
  startGame,
}));

describe("startPassAndPlaySession", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("creates a room and immediately starts the round", async () => {
    createPassAndPlayRoom.mockResolvedValue({
      success: true,
      data: {
        roomId: "room-1",
        code: "ABCDE",
        hostPlayerId: "player-1",
        players: [
          { id: "player-1", name: "Alice" },
          { id: "player-2", name: "Bob" },
          { id: "player-3", name: "Charlie" },
        ],
      },
    });
    startGame.mockResolvedValue({
      success: true,
      data: {
        gameId: "game-1",
        startedAt: "2026-04-11T12:00:00.000Z",
      },
    });

    const { startPassAndPlaySession } = await import("./actions");
    const result = await startPassAndPlaySession({
      players: {
        names: ["Alice", "Bob", "Charlie"],
      },
    });

    expect(result).toEqual({
      success: true,
      data: {
        room: {
          roomId: "room-1",
          code: "ABCDE",
          hostPlayerId: "player-1",
          players: [
            { id: "player-1", name: "Alice" },
            { id: "player-2", name: "Bob" },
            { id: "player-3", name: "Charlie" },
          ],
        },
        game: {
          gameId: "game-1",
          startedAt: "2026-04-11T12:00:00.000Z",
        },
      },
    });
    expect(startGame).toHaveBeenCalledWith({
      roomId: "room-1",
      playerId: "player-1",
    });
  });

  it("returns the room creation error without trying to start a game", async () => {
    createPassAndPlayRoom.mockResolvedValue({
      success: false,
      error: "Collection not found",
    });

    const { startPassAndPlaySession } = await import("./actions");
    const result = await startPassAndPlaySession({
      players: {
        names: ["Alice", "Bob", "Charlie"],
      },
    });

    expect(result).toEqual({
      success: false,
      error: "Collection not found",
    });
    expect(startGame).not.toHaveBeenCalled();
  });

  it("returns the game start error after a room is created", async () => {
    createPassAndPlayRoom.mockResolvedValue({
      success: true,
      data: {
        roomId: "room-1",
        code: "ABCDE",
        hostPlayerId: "player-1",
        players: [{ id: "player-1", name: "Alice" }],
      },
    });
    startGame.mockResolvedValue({
      success: false,
      error: "Failed to start game",
    });

    const { startPassAndPlaySession } = await import("./actions");
    const result = await startPassAndPlaySession({
      players: {
        names: ["Alice", "Bob", "Charlie"],
      },
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to start game",
    });
  });
});
