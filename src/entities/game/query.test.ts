import { beforeEach, describe, expect, it, vi } from "vitest";

const { getGameState } = vi.hoisted(() => ({
  getGameState: vi.fn(),
}));

vi.mock("@/entities/game/actions", () => ({
  getGameState,
}));

describe("game entity query", () => {
  beforeEach(() => {
    getGameState.mockReset();
  });

  it("fetches player role data through the entity action layer", async () => {
    getGameState.mockResolvedValue({
      success: true,
      data: {
        myRole: "Pilot",
        isSpy: false,
        location: "Airplane",
      },
    });

    const { fetchPlayerRole } = await import("./query");

    await expect(fetchPlayerRole("game-1", "player-1")).resolves.toEqual({
      myRole: "Pilot",
      isSpy: false,
      location: "Airplane",
    });
    expect(getGameState).toHaveBeenCalledWith("game-1", "player-1");
  });
});
