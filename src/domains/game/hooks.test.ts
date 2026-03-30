import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// We need to test useTimer which is a pure timer hook.
// useGameState depends on react-query and server actions, so we skip it here.

// Re-implement computeRemaining for test assertions (mirrors the logic in hooks.ts)
function computeRemaining(startedAt: string | null, timeLimit: number): number {
  if (!startedAt) return timeLimit;
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  return Math.max(0, timeLimit - elapsed);
}

// We need to mock the module imports to isolate useTimer
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock("@/domains/game/actions", () => ({
  getGameState: vi.fn(),
}));

vi.mock("@/shared/lib/unwrap-action", () => ({
  unwrapAction: vi.fn(),
}));

// Import after mocks
const { useTimer } = await import("./hooks");

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns full time when startedAt is null", () => {
    const { result } = renderHook(() => useTimer(null, 480));
    expect(result.current.remaining).toBe(480);
    expect(result.current.isExpired).toBe(false);
  });

  it("formats display correctly", () => {
    const { result } = renderHook(() => useTimer(null, 480));
    expect(result.current.display).toBe("8:00");
  });

  it("formats display with leading zeros for seconds", () => {
    const { result } = renderHook(() => useTimer(null, 65));
    expect(result.current.display).toBe("1:05");
  });

  it("computes remaining time from startedAt", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    // Started 60 seconds ago with a 480 second limit
    const startedAt = new Date(now - 60_000).toISOString();
    const { result } = renderHook(() => useTimer(startedAt, 480));
    expect(result.current.remaining).toBe(420);
    expect(result.current.isExpired).toBe(false);
  });

  it("counts down over time", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const startedAt = new Date(now).toISOString();

    const { result } = renderHook(() => useTimer(startedAt, 480, true));

    expect(result.current.remaining).toBe(480);

    // Advance 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.remaining).toBe(475);
  });

  it("sets isExpired when timer reaches zero", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const startedAt = new Date(now - 478_000).toISOString();

    const { result } = renderHook(() => useTimer(startedAt, 480, true));
    expect(result.current.remaining).toBe(2);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.remaining).toBe(0);
    expect(result.current.isExpired).toBe(true);
  });

  it("does not tick when running is false", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const startedAt = new Date(now).toISOString();

    const { result } = renderHook(() => useTimer(startedAt, 480, false));
    const initial = result.current.remaining;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should not have changed because running=false
    expect(result.current.remaining).toBe(initial);
  });

  it("never goes below zero", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    // Started way in the past
    const startedAt = new Date(now - 999_000).toISOString();

    const { result } = renderHook(() => useTimer(startedAt, 480, true));
    expect(result.current.remaining).toBe(0);
    expect(result.current.isExpired).toBe(true);
  });

  it("formats zero correctly", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const startedAt = new Date(now - 999_000).toISOString();

    const { result } = renderHook(() => useTimer(startedAt, 480, true));
    expect(result.current.display).toBe("0:00");
  });
});
