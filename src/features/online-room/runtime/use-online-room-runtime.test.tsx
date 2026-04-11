import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useOnlineRoomRuntime } from "./use-online-room-runtime";

const { replace, useRoomState, useSession } = vi.hoisted(() => ({
  replace: vi.fn(),
  useRoomState: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
  }),
}));

vi.mock("@/shared/hooks/use-session", () => ({
  useSession,
}));

vi.mock("@/entities/room/query", () => ({
  useRoomState,
}));

vi.mock("@/shared/i18n/context", () => ({
  useTranslation: () => ({
    t: {
      common: { loading: "Loading room" },
    },
  }),
}));

describe("useOnlineRoomRuntime", () => {
  beforeEach(() => {
    replace.mockReset();
    useRoomState.mockReturnValue({
      data: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects pass-and-play sessions back to the pass-and-play runtime", async () => {
    useSession.mockReturnValue({
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
    });

    renderHook(() => useOnlineRoomRuntime("abcde"));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/play/pass-and-play/ABCDE");
    });
  });

  it("redirects back to the lobby when the room is not active", async () => {
    useSession.mockReturnValue({
      isLoaded: true,
      session: {
        isHost: true,
        mode: "online",
        playerId: "player-1",
        roomCode: "ABCDE",
        roomId: "room-1",
      },
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
    });

    renderHook(() => useOnlineRoomRuntime("ABCDE"));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/room/ABCDE");
    });
  });
});
