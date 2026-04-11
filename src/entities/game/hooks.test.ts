import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getGameState } = vi.hoisted(() => ({
  getGameState: vi.fn(),
}));

vi.mock("@/entities/game/actions", () => ({
  getGameState,
}));

describe("game entity hooks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats timer output with leading zeros for seconds", async () => {
    const { useTimer } = await import("./hooks");
    const { result } = renderHook(() => useTimer(null, 65));

    expect(result.current.display).toBe("1:05");
  });

  it("counts down over time when the timer is running", async () => {
    const { useTimer } = await import("./hooks");
    const now = Date.now();
    vi.setSystemTime(now);

    const { result } = renderHook(() => useTimer(new Date(now).toISOString(), 480, true));

    expect(result.current.remaining).toBe(480);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.remaining).toBe(475);
  });
});
