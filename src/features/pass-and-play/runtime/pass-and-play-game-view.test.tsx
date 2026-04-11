import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PassAndPlayGameView } from "./pass-and-play-game-view";
import { usePassAndPlay } from "./use-pass-and-play";

vi.mock("./use-pass-and-play", () => ({
  usePassAndPlay: vi.fn(),
}));

vi.mock("./pass-and-play-game-view-parts", () => ({
  PhaseRouter: ({
    allPlayers,
    hostPlayerId,
  }: {
    allPlayers: Array<{ id: string; name: string }>;
    hostPlayerId: string;
  }) => <div>{`Phase router ${hostPlayerId} ${allPlayers.length}`}</div>,
}));

vi.mock("@/shared/i18n/context", () => ({
  useTranslation: () => ({
    t: { game: { endGame: "End game" } },
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const usePassAndPlayMock = vi.mocked(usePassAndPlay);

const baseProps = {
  allPlayers: [{ id: "player-1", name: "Alice" }],
  gameId: "game-1",
  gameStartedAt: "2026-04-11T10:00:00.000Z",
  hostPlayerId: "player-1",
  isTimerRunning: false,
  roomCode: "ABCDE",
  roomId: "room-1",
  shouldHideSpyCount: false,
  spyCount: 1,
  timeLimit: 480,
};

describe("PassAndPlayGameView", () => {
  it("shows an error when the game failed to load after reveal", () => {
    usePassAndPlayMock.mockReturnValue({
      game: null,
      isLoading: false,
      phase: "playing",
    } as never);

    render(<PassAndPlayGameView {...baseProps} />);

    expect(screen.getByText("Failed to load game")).toBeInTheDocument();
  });

  it("renders the phase router while the runtime is active", () => {
    usePassAndPlayMock.mockReturnValue({
      game: { id: "game-1" },
      handleLeave: vi.fn(),
      handlePlayAgain: vi.fn(),
      handleRoleRevealComplete: vi.fn(),
      isLoading: false,
      phase: "role-reveal",
      playAgainMutation: { isPending: false },
      shouldShowReveal: false,
    } as never);

    render(<PassAndPlayGameView {...baseProps} />);

    expect(screen.getByText("Phase router player-1 1")).toBeInTheDocument();
  });
});
