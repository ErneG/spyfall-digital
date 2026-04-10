import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useSession, type Session } from "./use-session";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("useSession", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("returns null session initially when storage is empty", () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.session).toBeNull();
  });

  it("returns isLoaded as true in browser environment", () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.isLoaded).toBe(true);
  });

  it("sets a session and persists to localStorage", () => {
    const { result } = renderHook(() => useSession());

    const newSession: Session = {
      mode: "online",
      playerId: "p1",
      roomCode: "ABCDE",
      roomId: "room-1",
      isHost: true,
    };

    act(() => {
      result.current.setSession(newSession);
    });

    expect(result.current.session).toEqual(newSession);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "spyfall-session",
      JSON.stringify(newSession),
    );
  });

  it("clears session and removes from localStorage", () => {
    const { result } = renderHook(() => useSession());

    const session: Session = {
      mode: "online",
      playerId: "p1",
      roomCode: "ABCDE",
      roomId: "room-1",
      isHost: false,
    };

    act(() => {
      result.current.setSession(session);
    });
    expect(result.current.session).toEqual(session);

    act(() => {
      result.current.clearSession();
    });

    expect(result.current.session).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("spyfall-session");
  });

  it("reads existing session from localStorage on mount", () => {
    const existingSession: Session = {
      mode: "online",
      playerId: "p2",
      roomCode: "FGHKL",
      roomId: "room-2",
      isHost: true,
    };
    localStorageMock.setItem("spyfall-session", JSON.stringify(existingSession));

    const { result } = renderHook(() => useSession());
    expect(result.current.session).toEqual(existingSession);
  });

  it("handles corrupt localStorage data gracefully", () => {
    localStorageMock.setItem("spyfall-session", "not-valid-json{{{");

    // The current implementation uses JSON.parse which will throw,
    // but readSession catches it and returns null
    const { result } = renderHook(() => useSession());
    expect(result.current.session).toBeNull();
  });

  it("supports pass-and-play session data", () => {
    const { result } = renderHook(() => useSession());

    const passAndPlaySession: Session = {
      mode: "pass-and-play",
      playerId: "p1",
      roomCode: "ABCDE",
      roomId: "room-1",
      isHost: true,
      resume: {
        players: [
          { id: "p1", name: "Alice" },
          { id: "p2", name: "Bob" },
        ],
        gameId: "game-1",
        gameStartedAt: "2026-04-10T09:00:00.000Z",
        timeLimit: 480,
        spyCount: 1,
        hideSpyCount: false,
      },
    };

    act(() => {
      result.current.setSession(passAndPlaySession);
    });

    expect(result.current.session?.mode).toBe("pass-and-play");
    if (result.current.session?.mode === "pass-and-play") {
      expect(result.current.session.resume.players).toHaveLength(2);
    }
  });

  it("migrates a legacy online session from localStorage", () => {
    localStorageMock.setItem(
      "spyfall-session",
      JSON.stringify({
        playerId: "p2",
        roomCode: "FGHKL",
        roomId: "room-2",
        isHost: true,
      }),
    );

    const { result } = renderHook(() => useSession());
    expect(result.current.session).toEqual({
      mode: "online",
      playerId: "p2",
      roomCode: "FGHKL",
      roomId: "room-2",
      isHost: true,
    });
  });

  it("migrates a legacy pass-and-play session from localStorage", () => {
    localStorageMock.setItem(
      "spyfall-session",
      JSON.stringify({
        playerId: "p1",
        roomCode: "ABCDE",
        roomId: "room-1",
        isHost: true,
        passAndPlay: true,
        allPlayers: [
          { id: "p1", name: "Alice" },
          { id: "p2", name: "Bob" },
        ],
        gameId: "game-1",
        gameStartedAt: "2026-04-10T09:00:00.000Z",
        timeLimit: 480,
        spyCount: 1,
        hideSpyCount: false,
      }),
    );

    const { result } = renderHook(() => useSession());
    expect(result.current.session).toEqual({
      mode: "pass-and-play",
      playerId: "p1",
      roomCode: "ABCDE",
      roomId: "room-1",
      isHost: true,
      resume: {
        players: [
          { id: "p1", name: "Alice" },
          { id: "p2", name: "Bob" },
        ],
        gameId: "game-1",
        gameStartedAt: "2026-04-10T09:00:00.000Z",
        timeLimit: 480,
        spyCount: 1,
        hideSpyCount: false,
      },
    });
  });
});
