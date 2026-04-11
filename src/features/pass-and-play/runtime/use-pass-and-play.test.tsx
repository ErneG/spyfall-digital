import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePassAndPlay } from "./use-pass-and-play";

const {
  clearSession,
  endMutate,
  push,
  restartGame,
  setSession,
  startGame,
  timerMutate,
  useExpiryBeep,
  useGameActions,
  useGameState,
  useSession,
  useTimer,
} = vi.hoisted(() => ({
  clearSession: vi.fn(),
  endMutate: vi.fn(),
  push: vi.fn(),
  restartGame: vi.fn(),
  setSession: vi.fn(),
  startGame: vi.fn(),
  timerMutate: vi.fn(),
  useExpiryBeep: vi.fn(),
  useGameActions: vi.fn(),
  useGameState: vi.fn(),
  useSession: vi.fn(),
  useTimer: vi.fn(),
}));

type MutationOptions<TResult> = {
  mutationFn: () => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: <TResult,>(options: MutationOptions<TResult>) => ({
    isPending: false,
    mutate: () => {
      void options.mutationFn().then((result) => {
        options.onSuccess?.(result);
        return result;
      });
    },
  }),
}));

vi.mock("@/entities/game/actions", () => ({
  restartGame,
  startGame,
}));

vi.mock("@/entities/game/hooks", () => ({
  useGameState,
  useTimer,
}));

vi.mock("@/entities/game/pass-and-play", () => ({
  useExpiryBeep,
  useGameActions,
}));

vi.mock("@/shared/hooks/use-session", () => ({
  useSession,
}));

vi.mock("@/shared/lib/unwrap-action", () => ({
  unwrapAction: <T,>(result: { success: boolean; data: T }) => result.data,
}));

const baseProps = {
  gameId: "game-1",
  hostPlayerId: "player-1",
  roomId: "room-1",
  timeLimit: 480,
  gameStartedAt: "2026-04-11T10:00:00.000Z",
  isTimerRunning: false,
};

const baseSession = {
  isHost: true,
  mode: "pass-and-play" as const,
  playerId: "player-1",
  roomCode: "ABCDE",
  roomId: "room-1",
  resume: {
    gameId: "game-1",
    gameStartedAt: "2026-04-11T10:00:00.000Z",
    hideSpyCount: false,
    players: [{ id: "player-1", name: "Alice" }],
    spyCount: 1,
    timeLimit: 480,
  },
};

describe("usePassAndPlay", () => {
  beforeEach(() => {
    push.mockReset();
    clearSession.mockReset();
    setSession.mockReset();
    restartGame.mockReset();
    startGame.mockReset();
    timerMutate.mockReset();
    endMutate.mockReset();
    useExpiryBeep.mockReset();

    useSession.mockReturnValue({
      clearSession,
      session: baseSession,
      setSession,
    });

    useGameState.mockReturnValue({
      game: {
        phase: "REVEAL",
        timerRunning: true,
        startedAt: "2026-04-11T10:00:00.000Z",
        timeLimit: 480,
      },
      isLoading: false,
    });

    useTimer.mockReturnValue({
      display: "08:00",
      isExpired: false,
    });

    useGameActions.mockReturnValue({
      endMutation: { isPending: false, mutate: endMutate },
      timerMutation: { mutate: timerMutate },
    });

    restartGame.mockResolvedValue({ success: true, data: null });
    startGame.mockResolvedValue({
      success: true,
      data: {
        gameId: "game-2",
        startedAt: "2026-04-11T10:15:00.000Z",
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("moves from role reveal into the live round and pauses the timer mutation", () => {
    const { result } = renderHook(() => usePassAndPlay(baseProps));

    act(() => {
      result.current.handleRoleRevealComplete();
    });

    expect(timerMutate).toHaveBeenCalledWith(false);
    expect(result.current.phase).toBe("playing");
    expect(result.current.shouldShowReveal).toBe(true);
    expect(useExpiryBeep).toHaveBeenCalledWith(false);
  });

  it("clears the stored session and returns home when leaving the round", () => {
    const { result } = renderHook(() => usePassAndPlay(baseProps));

    act(() => {
      result.current.handleLeave();
    });

    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/");
  });

  it("restarts the round, resets phase, and updates the stored resume state", async () => {
    const { result } = renderHook(() => usePassAndPlay(baseProps));

    act(() => {
      result.current.handleRoleRevealComplete();
      result.current.handlePlayAgain();
    });

    await waitFor(() => {
      expect(result.current.activeGameId).toBe("game-2");
    });

    expect(restartGame).toHaveBeenCalledWith({ gameId: "game-1", playerId: "player-1" });
    expect(startGame).toHaveBeenCalledWith({ roomId: "room-1", playerId: "player-1" });
    expect(result.current.roundNumber).toBe(2);
    expect(result.current.phase).toBe("role-reveal");
    expect(setSession).toHaveBeenCalledWith({
      ...baseSession,
      resume: {
        ...baseSession.resume,
        gameId: "game-2",
        gameStartedAt: "2026-04-11T10:15:00.000Z",
      },
    });
  });
});
