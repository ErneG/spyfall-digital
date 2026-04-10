import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { roomKeys } from "@/entities/room/query";

import { CollectionPicker } from "./collection-picker";

import type { CollectionListItem } from "../schema";
import type { ApplyRoomContentSourceOutput } from "@/domains/room/schema";
import type { ActionResult } from "@/shared/types/action-result";
import type { ReactNode } from "react";

const getCollectionsMock = vi.fn<() => Promise<ActionResult<CollectionListItem[]>>>();
const applyRoomContentSourceMock =
  vi.fn<() => Promise<ActionResult<ApplyRoomContentSourceOutput>>>();
const invalidateQueriesMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

vi.mock("@/domains/auth/hooks", () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

vi.mock("@/shared/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

vi.mock("../actions", () => ({
  getCollections: () => getCollectionsMock(),
}));

vi.mock("@/domains/room/actions", () => ({
  applyRoomContentSource: (input: unknown) => applyRoomContentSourceMock(input),
}));

describe("CollectionPicker", () => {
  beforeEach(() => {
    getCollectionsMock.mockReset();
    applyRoomContentSourceMock.mockReset();
    invalidateQueriesMock.mockReset();
  });

  it("uses the canonical room content source mutation when a collection is selected", async () => {
    const user = userEvent.setup();
    const onImported = vi.fn();
    const onOpenChange = vi.fn();

    getCollectionsMock.mockResolvedValue({
      success: true,
      data: [
        {
          id: "collection-1",
          name: "Starter Pack",
          description: null,
          locationCount: 3,
          createdAt: "2026-04-10T10:00:00.000Z",
        },
      ],
    });
    applyRoomContentSourceMock.mockResolvedValue({
      success: true,
      data: {
        selectedLocationCount: 3,
        sourceKind: "collection",
      },
    });

    render(
      <CollectionPicker
        open
        onOpenChange={onOpenChange}
        roomCode="abcde"
        playerId="player-1"
        onImported={onImported}
      />,
    );

    await user.click(await screen.findByRole("button", { name: /starter pack/i }));

    await waitFor(() => {
      expect(applyRoomContentSourceMock).toHaveBeenCalledWith({
        playerId: "player-1",
        roomCode: "abcde",
        source: {
          kind: "collection",
          collectionId: "collection-1",
        },
      });
    });

    await waitFor(() => {
      expect(invalidateQueriesMock).toHaveBeenCalledWith({
        queryKey: roomKeys.state("abcde"),
      });
    });
    expect(onImported).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows action failures inline", async () => {
    const user = userEvent.setup();

    getCollectionsMock.mockResolvedValue({
      success: true,
      data: [
        {
          id: "collection-1",
          name: "Starter Pack",
          description: null,
          locationCount: 3,
          createdAt: "2026-04-10T10:00:00.000Z",
        },
      ],
    });
    applyRoomContentSourceMock.mockResolvedValue({
      success: false,
      error: "Collection not found",
    });

    render(
      <CollectionPicker
        open
        onOpenChange={vi.fn()}
        roomCode="ABCDE"
        playerId="player-1"
        onImported={vi.fn()}
      />,
    );

    await user.click(await screen.findByRole("button", { name: /starter pack/i }));

    await waitFor(() => {
      expect(screen.getByText("Collection not found")).toBeInTheDocument();
    });
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
