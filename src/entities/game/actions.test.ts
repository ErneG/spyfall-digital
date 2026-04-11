import { beforeEach, describe, expect, it, vi } from "vitest";

const castVote = vi.fn();
const endGame = vi.fn();
const getGameState = vi.fn();
const restartGame = vi.fn();
const startGame = vi.fn();
const toggleTimer = vi.fn();

vi.mock("@/domains/game/actions", () => ({
  castVote,
  endGame,
  getGameState,
  restartGame,
  startGame,
  toggleTimer,
}));

describe("game entity actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("delegates game server actions through the entity layer", async () => {
    castVote.mockResolvedValue({ success: true, data: { voteId: "vote-1" } });
    endGame.mockResolvedValue({ success: true, data: { ended: true } });
    getGameState.mockResolvedValue({ success: true, data: { id: "game-1" } });
    restartGame.mockResolvedValue({ success: true, data: { restarted: true } });
    startGame.mockResolvedValue({ success: true, data: { gameId: "game-2" } });
    toggleTimer.mockResolvedValue({ success: true, data: { timerRunning: true } });

    const gameActions = await import("./actions");

    await expect(
      gameActions.castVote({
        gameId: "game-1",
        playerId: "player-1",
        suspectId: "player-2",
      }),
    ).resolves.toEqual({ success: true, data: { voteId: "vote-1" } });
    await expect(gameActions.endGame({ gameId: "game-1", playerId: "player-1" })).resolves.toEqual({
      success: true,
      data: { ended: true },
    });
    await expect(gameActions.getGameState("game-1", "player-1")).resolves.toEqual({
      success: true,
      data: { id: "game-1" },
    });
    await expect(
      gameActions.restartGame({ gameId: "game-1", playerId: "player-1" }),
    ).resolves.toEqual({ success: true, data: { restarted: true } });
    await expect(
      gameActions.startGame({ roomId: "room-1", playerId: "player-1" }),
    ).resolves.toEqual({ success: true, data: { gameId: "game-2" } });
    await expect(
      gameActions.toggleTimer({ gameId: "game-1", playerId: "player-1", running: true }),
    ).resolves.toEqual({ success: true, data: { timerRunning: true } });
  });
});
