import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { I18nProvider } from "@/shared/i18n/context";

const { useGameView } = vi.hoisted(() => ({
  useGameView: vi.fn(),
}));

vi.mock("./use-game-view", () => ({
  useGameView,
}));

describe("game entity view surface", () => {
  it("renders the loading state through the entity-owned view", async () => {
    const { GameView } = await import("./view");

    useGameView.mockReturnValue({
      game: null,
      isLoading: true,
      t: {
        common: { loading: "Loading..." },
      },
    });

    render(
      <I18nProvider>
        <GameView
          gameId="game-1"
          playerId="player-1"
          isHost={false}
          roomCode="ABCDE"
          timeLimit={480}
          gameStartedAt={null}
          hideSpyCount={false}
          spyCount={1}
          isTimerRunning={true}
        />
      </I18nProvider>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
