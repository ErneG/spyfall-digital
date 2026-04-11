import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RoomSourceCollectionPicker } from "./room-source-collection-picker";

const { invalidateQueries, applyRoomContentSource, useLibraryCollections } = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  applyRoomContentSource: vi.fn(),
  useLibraryCollections: vi.fn(),
}));

vi.mock("@/entities/room/actions", () => ({
  applyRoomContentSource,
}));

vi.mock("@/features/library/use-library-collections", () => ({
  useLibraryCollections,
}));

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: false,
      },
    },
  });

  vi.spyOn(queryClient, "invalidateQueries").mockImplementation(invalidateQueries);

  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  };
}

describe("RoomSourceCollectionPicker", () => {
  beforeEach(() => {
    invalidateQueries.mockReset();
    applyRoomContentSource.mockReset();
    useLibraryCollections.mockReset();
    useLibraryCollections.mockReturnValue({
      collections: [
        {
          id: "collection-1",
          name: "Night Shift",
          description: null,
          locationCount: 7,
          createdAt: "2026-04-11T00:00:00.000Z",
        },
      ],
      error: null,
      isAuthenticated: true,
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("applies a collection-backed room source and refreshes the room query", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    applyRoomContentSource.mockResolvedValue({
      success: true,
      data: {
        selectedLocationCount: 7,
        sourceKind: "collection",
      },
    });

    renderWithQueryClient(
      <RoomSourceCollectionPicker
        open
        onOpenChange={onOpenChange}
        roomCode="abcde"
        playerId="player-1"
      />,
    );

    await user.click(screen.getByRole("button", { name: /use/i }));

    await waitFor(() =>
      expect(applyRoomContentSource).toHaveBeenCalledWith({
        playerId: "player-1",
        roomCode: "abcde",
        source: {
          kind: "collection",
          collectionId: "collection-1",
        },
      }),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["room", "ABCDE", "state"],
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows the library sign-in guidance when collections are unavailable", () => {
    useLibraryCollections.mockReturnValue({
      collections: [],
      error: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithQueryClient(
      <RoomSourceCollectionPicker
        open
        onOpenChange={vi.fn()}
        roomCode="ABCDE"
        playerId="player-1"
      />,
    );

    expect(screen.getByText("Sign in to use Library collections.")).toBeInTheDocument();
  });
});
