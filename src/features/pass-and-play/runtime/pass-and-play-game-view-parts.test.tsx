import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/entities/game/pass-and-play", () => ({
  RevealScreen: () => <div>Reveal screen</div>,
  RoleRevealCarousel: () => <div>Role reveal carousel</div>,
}));

vi.mock("./pass-and-play-playing", () => ({
  PlayingPhase: () => <div>Playing phase</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseState = {
  activeGameId: "game-1",
  game: null,
  handleLeave: vi.fn(),
  handlePlayAgain: vi.fn(),
  handleRoleRevealComplete: vi.fn(),
  phase: "playing",
  playAgainMutation: { isPending: false },
  shouldShowReveal: false,
};

const translations = {
  game: { endGame: "End game" },
  passAndPlay: { peekAtRole: "Peek at role" },
  players: { title: "Players" },
};

describe("PhaseRouter", () => {
  it("shows the role-reveal carousel during the reveal phase", async () => {
    const { PhaseRouter } = await import("./pass-and-play-game-view-parts");

    render(
      <PhaseRouter
        state={{ ...baseState, phase: "role-reveal" } as never}
        hostPlayerId="player-1"
        allPlayers={[{ id: "player-1", name: "Alice" }]}
        shouldHideSpyCount={false}
        spyCount={1}
        t={translations as never}
      />,
    );

    expect(screen.getByText("Role reveal carousel")).toBeInTheDocument();
  });

  it("shows the reveal screen when the server is still in reveal", async () => {
    const { PhaseRouter } = await import("./pass-and-play-game-view-parts");

    render(
      <PhaseRouter
        state={
          {
            ...baseState,
            game: { id: "game-1" },
            shouldShowReveal: true,
          } as never
        }
        hostPlayerId="player-1"
        allPlayers={[{ id: "player-1", name: "Alice" }]}
        shouldHideSpyCount={false}
        spyCount={1}
        t={translations as never}
      />,
    );

    expect(screen.getByText("Reveal screen")).toBeInTheDocument();
  });

  it("falls back to the playing phase otherwise", async () => {
    const { PhaseRouter } = await import("./pass-and-play-game-view-parts");

    render(
      <PhaseRouter
        state={baseState as never}
        hostPlayerId="player-1"
        allPlayers={[{ id: "player-1", name: "Alice" }]}
        shouldHideSpyCount={false}
        spyCount={1}
        t={translations as never}
      />,
    );

    expect(screen.getByText("Playing phase")).toBeInTheDocument();
  });
});
