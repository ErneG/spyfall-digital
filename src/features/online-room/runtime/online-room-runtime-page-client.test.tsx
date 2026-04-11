import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useOnlineRoomRuntime } = vi.hoisted(() => ({
  useOnlineRoomRuntime: vi.fn(),
}));

vi.mock("./use-online-room-runtime", () => ({
  useOnlineRoomRuntime,
}));

vi.mock("@/entities/game/view", () => ({
  GameView: ({ gameId }: { gameId: string }) => <div>Online runtime {gameId}</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderRuntimeClient(code = "ABCDE") {
  const { OnlineRoomRuntimePageClient } = await import("./online-room-runtime-page-client");

  return render(<OnlineRoomRuntimePageClient code={code} />);
}

const baseState = {
  isLoaded: true,
  room: null,
  session: null,
  t: {
    common: { loading: "Loading room" },
  },
};

describe("OnlineRoomRuntimePageClient", () => {
  it("renders nothing until the session is ready", async () => {
    useOnlineRoomRuntime.mockReturnValue({
      ...baseState,
      isLoaded: false,
    } as never);

    const { container } = await renderRuntimeClient();

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the loading state until an active game is available", async () => {
    useOnlineRoomRuntime.mockReturnValue({
      ...baseState,
      session: {
        isHost: true,
        mode: "online",
        playerId: "player-1",
        roomCode: "ABCDE",
        roomId: "room-1",
      },
    } as never);

    await renderRuntimeClient();

    expect(screen.getByText("Loading room")).toBeInTheDocument();
  });

  it("renders the immersive online runtime once the room is active", async () => {
    useOnlineRoomRuntime.mockReturnValue({
      ...baseState,
      room: {
        autoStartTimer: false,
        currentGameId: "game-2",
        gameStartedAt: "2026-04-11T10:00:00.000Z",
        hideSpyCount: false,
        moderatorLocationId: null,
        moderatorMode: false,
        players: [],
        selectedLocationCount: 12,
        spyCount: 1,
        state: "PLAYING",
        timeLimit: 480,
        timerRunning: true,
        totalLocationCount: 54,
      },
      session: {
        isHost: true,
        mode: "online",
        playerId: "player-1",
        roomCode: "ABCDE",
        roomId: "room-1",
      },
    } as never);

    await renderRuntimeClient();

    expect(screen.getByText("Online runtime game-2")).toBeInTheDocument();
  });
});
