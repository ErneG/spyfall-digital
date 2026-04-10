import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PassAndPlayRoomPageClient } from "./pass-and-play-room-page-client";
import { usePassAndPlayRoomPage } from "./use-pass-and-play-room-page";

vi.mock("./use-pass-and-play-room-page", () => ({
  usePassAndPlayRoomPage: vi.fn(),
}));

vi.mock("./pass-and-play-game-view", () => ({
  PassAndPlayGameView: ({ gameId }: { gameId: string }) => <div>Pass and Play {gameId}</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const usePassAndPlayRoomPageMock = vi.mocked(usePassAndPlayRoomPage);

const baseState = {
  isLoaded: true,
  room: null,
  session: null,
  startGameMutation: { isPending: false },
  t: {
    common: { loading: "Loading pass and play" },
  },
};

describe("PassAndPlayRoomPageClient", () => {
  it("renders nothing until the session is ready", () => {
    usePassAndPlayRoomPageMock.mockReturnValue({
      ...baseState,
      isLoaded: false,
    } as never);

    const { container } = render(<PassAndPlayRoomPageClient code="ABCDE" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the pass-and-play runtime for pass-and-play sessions", () => {
    usePassAndPlayRoomPageMock.mockReturnValue({
      ...baseState,
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
    } as never);

    render(<PassAndPlayRoomPageClient code="ABCDE" />);

    expect(screen.getByText("Pass and Play game-1")).toBeInTheDocument();
  });

  it("shows a loading handoff while non pass-and-play sessions are redirected away", () => {
    usePassAndPlayRoomPageMock.mockReturnValue({
      ...baseState,
      session: {
        isHost: true,
        mode: "online",
        playerId: "player-1",
        roomCode: "ABCDE",
        roomId: "room-1",
      },
    } as never);

    render(<PassAndPlayRoomPageClient code="ABCDE" />);

    expect(screen.getByText("Loading pass and play")).toBeInTheDocument();
  });
});
