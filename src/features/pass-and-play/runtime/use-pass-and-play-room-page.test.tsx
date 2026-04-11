import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePassAndPlayRoomPage } from "./use-pass-and-play-room-page";

const { mutate, push, replace, useRoomState, useSession } = vi.hoisted(() => ({
  mutate: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  useRoomState: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    isPending: false,
    mutate,
  }),
}));

vi.mock("@/shared/hooks/use-session", () => ({
  useSession,
}));

vi.mock("@/entities/room/query", () => ({
  useRoomState,
}));

vi.mock("@/entities/game/actions", () => ({
  startGame: vi.fn(),
}));

vi.mock("@/shared/i18n/context", () => ({
  useTranslation: () => ({
    t: {
      common: { loading: "Loading pass and play" },
    },
  }),
}));

describe("usePassAndPlayRoomPage", () => {
  beforeEach(() => {
    mutate.mockReset();
    push.mockReset();
    replace.mockReset();
    useRoomState.mockReturnValue({
      data: null,
      isConnected: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects online sessions back to the online room route", async () => {
    useSession.mockReturnValue({
      clearSession: vi.fn(),
      isLoaded: true,
      session: {
        isHost: true,
        mode: "online",
        playerId: "player-1",
        roomCode: "ABCDE",
        roomId: "room-1",
      },
      setSession: vi.fn(),
    });

    renderHook(() => usePassAndPlayRoomPage("abcde"));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/room/ABCDE");
    });
  });

  it("redirects to home when the stored session belongs to a different room", async () => {
    useSession.mockReturnValue({
      clearSession: vi.fn(),
      isLoaded: true,
      session: {
        isHost: true,
        mode: "pass-and-play",
        playerId: "player-1",
        resume: {
          gameId: "game-1",
          gameStartedAt: "2026-04-11T10:00:00.000Z",
          hideSpyCount: false,
          players: [{ id: "player-1", name: "Alice" }],
          spyCount: 1,
          timeLimit: 480,
        },
        roomCode: "ZZZZZ",
        roomId: "room-1",
      },
      setSession: vi.fn(),
    });

    renderHook(() => usePassAndPlayRoomPage("abcde"));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/");
    });
  });

  it("tries to auto-start a new round when a pass-and-play room is back in the lobby", async () => {
    useSession.mockReturnValue({
      clearSession: vi.fn(),
      isLoaded: true,
      session: {
        isHost: true,
        mode: "pass-and-play",
        playerId: "player-1",
        resume: {
          gameId: "game-1",
          gameStartedAt: "2026-04-11T10:00:00.000Z",
          hideSpyCount: false,
          players: [{ id: "player-1", name: "Alice" }],
          spyCount: 1,
          timeLimit: 480,
        },
        roomCode: "ABCDE",
        roomId: "room-1",
      },
      setSession: vi.fn(),
    });
    useRoomState.mockReturnValue({
      data: {
        autoStartTimer: false,
        currentGameId: null,
        gameStartedAt: null,
        hideSpyCount: false,
        moderatorLocationId: null,
        moderatorMode: false,
        players: [],
        selectedLocationCount: 12,
        spyCount: 1,
        state: "LOBBY",
        timeLimit: 480,
        timerRunning: false,
        totalLocationCount: 54,
      },
      isConnected: true,
    });

    renderHook(() => usePassAndPlayRoomPage("ABCDE"));

    await waitFor(() => {
      const firstCall = mutate.mock.calls[0] as
        | [{ playerId: string; roomId: string }, { onSettled?: () => void }]
        | undefined;

      expect(firstCall?.[0]).toEqual({ playerId: "player-1", roomId: "room-1" });
      expect(typeof firstCall?.[1].onSettled).toBe("function");
    });
  });
});
