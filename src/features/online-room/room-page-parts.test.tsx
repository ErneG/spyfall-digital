import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RoomLobby } from "./room-page-parts";

vi.mock("./components/location-settings", () => ({
  LocationSettings: ({ open }: { open: boolean }) => (
    <div>{`Location settings ${open ? "open" : "closed"}`}</div>
  ),
}));

vi.mock("./components/room-source-collection-picker", () => ({
  RoomSourceCollectionPicker: ({ open }: { open: boolean }) => (
    <div>{`Room source collection picker ${open ? "open" : "closed"}`}</div>
  ),
}));

vi.mock("./components/game-config", () => ({
  GameConfig: () => <div>Game config</div>,
}));

vi.mock("./components/player-list", () => ({
  PlayerList: () => <div>Player list</div>,
}));

vi.mock("./components/room-code-header", () => ({
  RoomCodeHeader: () => <div>Room code header</div>,
}));

vi.mock("./components/start-section", () => ({
  StartSection: () => <div>Start section</div>,
}));

describe("RoomLobby", () => {
  it("mounts both source modals and reflects their open state", () => {
    render(
      <RoomLobby
        code="ABCDE"
        state={
          {
            error: "",
            handleCopy: vi.fn(),
            handleLeave: vi.fn(),
            handleOpenCollectionPicker: vi.fn(),
            handleOpenLocations: vi.fn(),
            handleStartClick: vi.fn(),
            isCollectionPickerOpen: true,
            isConnected: true,
            isCopied: false,
            isLoaded: true,
            isLocationsOpen: false,
            players: [],
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
            setIsCollectionPickerOpen: vi.fn(),
            setIsLocationsOpen: vi.fn(),
            startGameMutation: { isPending: false },
            t: {
              room: { leaveRoom: "Leave room" },
            },
          } as never
        }
      />,
    );

    expect(screen.getByText("Room source collection picker open")).toBeInTheDocument();
    expect(screen.getByText("Location settings closed")).toBeInTheDocument();
  });
});
