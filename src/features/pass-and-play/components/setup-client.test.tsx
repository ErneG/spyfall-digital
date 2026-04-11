import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PassAndPlaySetupClient } from "./setup-client";

const {
  push,
  replace,
  setSession,
  startPassAndPlaySession,
  useAuth,
  usePassAndPlaySources,
  useSession,
} = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  setSession: vi.fn(),
  startPassAndPlaySession: vi.fn(),
  useAuth: vi.fn(),
  usePassAndPlaySources: vi.fn(),
  useSession: vi.fn(),
}));

type MutationOptions<TVariables, TResult> = {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  onError?: (error: Error) => void;
  onSuccess?: (result: TResult) => void;
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: <TResult, TVariables>(options: MutationOptions<TVariables, TResult>) => ({
    isPending: false,
    mutate: (variables: TVariables) => {
      void options
        .mutationFn(variables)
        .then((result) => {
          options.onSuccess?.(result);
          return result;
        })
        .catch((error: Error) => {
          options.onError?.(error);
        });
    },
  }),
}));

vi.mock("@/entities/auth/use-auth", () => ({
  useAuth,
}));

vi.mock("@/shared/hooks/use-session", () => ({
  useSession,
}));

vi.mock("../actions", () => ({
  startPassAndPlaySession,
}));

vi.mock("../hooks/use-pass-and-play-sources", () => ({
  usePassAndPlaySources,
}));

vi.mock("./form", () => ({
  PassAndPlayForm: ({
    error,
    onPlayerNameChange,
    onStart,
    players,
  }: {
    error: string;
    onPlayerNameChange: (id: string, value: string) => void;
    onStart: () => void;
    players: Array<{ id: string }>;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => {
          onPlayerNameChange(players[0].id, " Avery ");
          onPlayerNameChange(players[1].id, " Jordan ");
          onPlayerNameChange(players[2].id, " Casey ");
        }}
      >
        Fill valid names
      </button>
      <button
        type="button"
        onClick={() => {
          onPlayerNameChange(players[0].id, "Alex");
          onPlayerNameChange(players[1].id, "Alex");
          onPlayerNameChange(players[2].id, "Casey");
        }}
      >
        Fill duplicate names
      </button>
      <button type="button" onClick={onStart}>
        Start Game
      </button>
      {error ? <p>{error}</p> : null}
    </div>
  ),
}));

vi.mock("./source-section", () => ({
  PassAndPlaySourceSection: () => <div>Source section</div>,
}));

vi.mock("@/shared/ui/location-catalog-preview", () => ({
  LocationCatalogPreview: () => <div>Preview</div>,
}));

describe("PassAndPlaySetupClient", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    setSession.mockReset();
    startPassAndPlaySession.mockReset();

    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    usePassAndPlaySources.mockReturnValue({
      availableCollections: [],
      collectionDetailQuery: { isLoading: false },
      collectionsQuery: { isLoading: false },
      previewLocations: [{ category: "Transportation", name: "Airplane", roles: ["Pilot"] }],
      source: {
        kind: "built-in",
        categories: ["Transportation"],
      },
      totalRoles: 1,
    });

    useSession.mockReturnValue({
      session: null,
      setSession,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("redirects existing pass-and-play sessions back into the runtime route", async () => {
    useSession.mockReturnValue({
      session: {
        mode: "pass-and-play",
        roomCode: "ABCDE",
      },
      setSession,
    });

    render(<PassAndPlaySetupClient />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/play/pass-and-play/ABCDE");
    });
  });

  it("shows a validation error when player names are duplicated", async () => {
    const user = userEvent.setup();

    render(<PassAndPlaySetupClient />);

    await user.click(screen.getByRole("button", { name: "Fill duplicate names" }));
    await user.click(screen.getByRole("button", { name: "Start Game" }));

    expect(screen.getByText("Each player needs a unique name.")).toBeInTheDocument();
    expect(startPassAndPlaySession).not.toHaveBeenCalled();
  });

  it("starts a pass-and-play session with trimmed names and stores the runtime session", async () => {
    const user = userEvent.setup();
    startPassAndPlaySession.mockResolvedValue({
      success: true,
      data: {
        room: {
          roomId: "room-1",
          code: "ABCDE",
          hostPlayerId: "player-1",
          players: [
            { id: "player-1", name: "Avery" },
            { id: "player-2", name: "Jordan" },
            { id: "player-3", name: "Casey" },
          ],
        },
        game: {
          gameId: "game-1",
          state: "PLAYING",
          startedAt: "2026-04-11T10:00:00.000Z",
          timerRunning: false,
        },
      },
    });

    render(<PassAndPlaySetupClient />);

    await user.click(screen.getByRole("button", { name: "Fill valid names" }));
    await user.click(screen.getByRole("button", { name: "Start Game" }));

    await waitFor(() => {
      expect(startPassAndPlaySession).toHaveBeenCalledWith({
        players: {
          names: ["Avery", "Jordan", "Casey"],
        },
        settings: {
          timeLimit: 480,
          spyCount: 1,
          hideSpyCount: false,
        },
        source: {
          kind: "built-in",
          categories: ["Transportation"],
        },
      });
    });

    expect(setSession).toHaveBeenCalledWith({
      mode: "pass-and-play",
      isHost: true,
      playerId: "player-1",
      roomCode: "ABCDE",
      roomId: "room-1",
      resume: {
        players: [
          { id: "player-1", name: "Avery" },
          { id: "player-2", name: "Jordan" },
          { id: "player-3", name: "Casey" },
        ],
        gameId: "game-1",
        gameStartedAt: "2026-04-11T10:00:00.000Z",
        timeLimit: 480,
        spyCount: 1,
        hideSpyCount: false,
      },
    });
    expect(push).toHaveBeenCalledWith("/play/pass-and-play/ABCDE");
  });
});
