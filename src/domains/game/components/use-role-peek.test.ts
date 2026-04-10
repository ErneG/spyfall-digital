import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/domains/game/hooks", () => ({
  fetchPlayerRole: vi.fn(),
}));

const { fetchPlayerRole } = await import("@/domains/game/hooks");
const { useRolePeek } = await import("./use-role-peek");

describe("useRolePeek", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts on a privacy handoff step before showing the player picker", () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useRolePeek("game-1", onExit));

    expect(result.current.step).toBe("handoff");

    act(() => {
      result.current.handleOpenPicker();
    });

    expect(result.current.step).toBe("picker");
    expect(onExit).not.toHaveBeenCalled();
  });

  it("returns to the privacy handoff after a reveal instead of exiting peek mode", async () => {
    vi.mocked(fetchPlayerRole).mockResolvedValue({
      isSpy: false,
      location: "Embassy",
      myRole: "Ambassador",
    });

    const onExit = vi.fn();
    const { result } = renderHook(() => useRolePeek("game-1", onExit));

    act(() => {
      result.current.handleOpenPicker();
    });

    await act(async () => {
      await result.current.handleSelectPlayer("player-1");
    });

    expect(result.current.step).toBe("reveal");
    expect(result.current.selectedPlayerId).toBe("player-1");
    expect(result.current.role).toEqual({
      isSpy: false,
      location: "Embassy",
      myRole: "Ambassador",
    });

    act(() => {
      result.current.handleDismissReveal();
    });

    expect(result.current.step).toBe("handoff");
    expect(result.current.selectedPlayerId).toBeNull();
    expect(result.current.role).toBeNull();
    expect(onExit).not.toHaveBeenCalled();
  });

  it("clears transient state and exits when the user leaves peek mode", async () => {
    vi.mocked(fetchPlayerRole).mockResolvedValue({
      isSpy: true,
      location: null,
      myRole: "Spy",
    });

    const onExit = vi.fn();
    const { result } = renderHook(() => useRolePeek("game-1", onExit));

    act(() => {
      result.current.handleOpenPicker();
    });

    await act(async () => {
      await result.current.handleSelectPlayer("player-2");
    });

    act(() => {
      result.current.handleExit();
    });

    expect(result.current.step).toBe("handoff");
    expect(result.current.selectedPlayerId).toBeNull();
    expect(result.current.role).toBeNull();
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
