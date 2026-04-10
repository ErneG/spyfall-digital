import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RoomPageClient } from "./room-page-client";
import { useRoomPage } from "./use-room-page";

vi.mock("./use-room-page", () => ({
  useRoomPage: vi.fn(),
}));

vi.mock("./room-page-parts", () => ({
  RoomLobby: ({ code }: { code: string }) => <div>Lobby {code}</div>,
  RoomLoadingSpinner: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock("@/domains/game/components/game-view", () => ({
  GameView: ({ gameId }: { gameId: string }) => <div>Online Game {gameId}</div>,
}));

vi.mock("@/features/pass-and-play/runtime/pass-and-play-game-view", () => ({
  PassAndPlayGameView: ({ gameId }: { gameId: string }) => <div>Pass and Play {gameId}</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const useRoomPageMock = vi.mocked(useRoomPage);

const baseState = {
  error: "",
  handleCopy: vi.fn(),
  handleLeave: vi.fn(),
  handleOpenLocations: vi.fn(),
  handleStartClick: vi.fn(),
  isConnected: true,
  isCopied: false,
  isLoaded: true,
  isLocationsOpen: false,
  players: [],
  room: null,
  session: null,
  setIsLocationsOpen: vi.fn(),
  startGameMutation: { isPending: false },
  t: {
    common: { loading: "Loading room" },
  },
};

describe("RoomPageClient", () => {
  it("renders nothing until the session is ready", () => {
    useRoomPageMock.mockReturnValue({
      ...baseState,
      isLoaded: false,
    } as never);

    const { container } = render(<RoomPageClient code="ABCDE" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the pass-and-play runtime for pass-and-play sessions", () => {
    useRoomPageMock.mockReturnValue({
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

    render(<RoomPageClient code="ABCDE" />);

    expect(screen.getByText("Pass and Play game-1")).toBeInTheDocument();
  });

  it("renders the online runtime when the room is in an active round", () => {
    useRoomPageMock.mockReturnValue({
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

    render(<RoomPageClient code="ABCDE" />);

    expect(screen.getByText("Online Game game-2")).toBeInTheDocument();
  });

  it("falls back to the room loading state when room data is missing", () => {
    useRoomPageMock.mockReturnValue({
      ...baseState,
      session: {
        isHost: true,
        mode: "online",
        playerId: "player-1",
        roomCode: "ABCDE",
        roomId: "room-1",
      },
    } as never);

    render(<RoomPageClient code="ABCDE" />);

    expect(screen.getByText("Loading room")).toBeInTheDocument();
  });

  it("renders the room lobby when the room is back in the lobby", () => {
    useRoomPageMock.mockReturnValue({
      ...baseState,
      room: {
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
      session: {
        isHost: true,
        mode: "online",
        playerId: "player-1",
        roomCode: "ABCDE",
        roomId: "room-1",
      },
    } as never);

    render(<RoomPageClient code="ABCDE" />);

    expect(screen.getByText("Lobby ABCDE")).toBeInTheDocument();
  });
});
