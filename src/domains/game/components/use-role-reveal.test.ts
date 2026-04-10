import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/domains/game/hooks", () => ({
  fetchPlayerRole: vi.fn(),
}));

const { fetchPlayerRole } = await import("@/domains/game/hooks");
const { useRoleReveal } = await import("./use-role-reveal");

const players = [
  { id: "player-1", name: "Avery" },
  { id: "player-2", name: "Jordan" },
];

describe("useRoleReveal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("surfaces fetch failures without breaking the reveal flow", async () => {
    vi.mocked(fetchPlayerRole).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useRoleReveal("game-1", players));

    act(() => {
      result.current.handleReady();
    });

    await act(async () => {
      await result.current.handleFlip();
    });

    expect(result.current.step).toBe("card");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFlipped).toBe(false);
    expect(result.current.role).toBeNull();
    expect(result.current.hasFetchError).toBe(true);
    expect(result.current.playerIndex).toBe(0);
  });

  it("resets reveal state before handing off to the next player", async () => {
    vi.mocked(fetchPlayerRole).mockResolvedValue({
      isSpy: false,
      location: "Embassy",
      myRole: "Analyst",
    });

    const { result } = renderHook(() => useRoleReveal("game-1", players));

    act(() => {
      result.current.handleReady();
    });

    await act(async () => {
      await result.current.handleFlip();
    });

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.playerIndex).toBe(1);
    expect(result.current.step).toBe("handoff");
    expect(result.current.role).toBeNull();
    expect(result.current.isFlipped).toBe(false);
    expect(result.current.hasFetchError).toBe(false);
  });
});
