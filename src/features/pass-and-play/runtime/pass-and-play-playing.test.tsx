import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/entities/game/pass-and-play", () => ({
  TimerSection: () => <div>Timer section</div>,
  PassAndPlayLocationGrid: () => <div>Location grid</div>,
  RolePeek: () => <div>Role peek</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderPlayingPhase(props: Record<string, unknown>) {
  const { PlayingPhase } = await import("./pass-and-play-playing");
  const TestPlayingPhase = PlayingPhase as unknown as React.ComponentType<Record<string, unknown>>;

  return render(<TestPlayingPhase {...props} />);
}

const translations = {
  game: {
    endGame: "End game",
    ending: "Ending",
  },
  passAndPlay: {
    peekAtRole: "Peek at role",
  },
  players: {
    title: "Players",
  },
};

const baseState = {
  activeGameId: "game-1",
  display: "08:00",
  endMutation: { isPending: false },
  game: {
    allLocations: [],
    prevLocationName: null,
  },
  handleLeave: vi.fn(),
  isExpired: false,
  isTimerRunning: false,
  onEndGameClick: vi.fn(),
  onTimerToggle: vi.fn(),
  roundNumber: 1,
};

describe("PlayingPhase", () => {
  it("shows round number and spy banner when applicable", async () => {
    await renderPlayingPhase({
      state: { ...baseState, roundNumber: 2 } as never,
      allPlayers: [
        { id: "player-1", name: "Alice" },
        { id: "player-2", name: "Bob" },
      ],
      shouldHideSpyCount: false,
      spyCount: 2,
      t: translations as never,
    });

    expect(screen.getByText("Round 2")).toBeInTheDocument();
    expect(screen.getByText("2 spies among you")).toBeInTheDocument();
    expect(screen.getByText("Players (2)")).toBeInTheDocument();
  });

  it("switches into peek mode when the player asks to peek again", async () => {
    const user = userEvent.setup();

    await renderPlayingPhase({
      state: baseState as never,
      allPlayers: [{ id: "player-1", name: "Alice" }],
      shouldHideSpyCount: true,
      spyCount: 1,
      t: translations as never,
    });

    await user.click(screen.getByRole("button", { name: /peek at role/i }));

    expect(screen.getByText("Role peek")).toBeInTheDocument();
  });

  it("disables the end-game action while the end mutation is pending", async () => {
    await renderPlayingPhase({
      state: { ...baseState, endMutation: { isPending: true } } as never,
      allPlayers: [{ id: "player-1", name: "Alice" }],
      shouldHideSpyCount: true,
      spyCount: 1,
      t: translations as never,
    });

    expect(screen.getByRole("button", { name: /ending/i })).toBeDisabled();
  });
});
