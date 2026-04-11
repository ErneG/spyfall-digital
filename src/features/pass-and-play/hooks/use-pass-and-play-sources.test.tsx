import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeQueryClient } from "@/shared/lib/query-client";

import { usePassAndPlaySources } from "./use-pass-and-play-sources";

const { getCollection, getCollections } = vi.hoisted(() => ({
  getCollection: vi.fn(),
  getCollections: vi.fn(),
}));

vi.mock("@/entities/library/actions", () => ({
  getCollection,
  getCollections,
}));

function createWrapper() {
  const queryClient = makeQueryClient();

  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("usePassAndPlaySources", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("builds the built-in preview without fetching collections for signed-out users", () => {
    const { result } = renderHook(
      () =>
        usePassAndPlaySources({
          authLoading: false,
          categories: ["Transportation"],
          isAuthenticated: false,
          selectedCollectionId: null,
          sourceMode: "built-in",
        }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.source).toEqual({
      kind: "built-in",
      categories: ["Transportation"],
    });
    expect(result.current.previewLocations.length).toBeGreaterThan(0);
    expect(
      result.current.previewLocations.every((location) => location.category === "Transportation"),
    ).toBe(true);
    expect(result.current.totalRoles).toBeGreaterThan(0);
    expect(result.current.availableCollections).toEqual([]);
    expect(getCollections).not.toHaveBeenCalled();
    expect(getCollection).not.toHaveBeenCalled();
  });

  it("hydrates collection-backed previews for authenticated users", async () => {
    getCollections.mockResolvedValue({
      success: true,
      data: [
        {
          id: "collection-1",
          name: "Night Shift",
          description: null,
          locationCount: 1,
          createdAt: "2026-04-11T10:00:00.000Z",
        },
      ],
    });
    getCollection.mockResolvedValue({
      success: true,
      data: {
        id: "collection-1",
        name: "Night Shift",
        description: null,
        locations: [
          {
            id: "location-1",
            name: "Casino",
            allSpies: false,
            roles: [
              { id: "role-1", name: "Dealer" },
              { id: "role-2", name: "Pit Boss" },
            ],
          },
        ],
      },
    });

    const { result } = renderHook(
      () =>
        usePassAndPlaySources({
          authLoading: false,
          categories: ["Transportation"],
          isAuthenticated: true,
          selectedCollectionId: "collection-1",
          sourceMode: "collection",
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.previewLocations).toHaveLength(1);
    });

    expect(result.current.activeCollectionId).toBe("collection-1");
    expect(result.current.source).toEqual({
      kind: "collection",
      collectionId: "collection-1",
    });
    expect(result.current.previewLocations).toEqual([
      {
        category: "Night Shift",
        name: "Casino",
        roles: ["Dealer", "Pit Boss"],
      },
    ]);
    expect(result.current.totalRoles).toBe(2);
    expect(result.current.availableCollections).toHaveLength(1);
    expect(getCollections).toHaveBeenCalledTimes(1);
    expect(getCollection).toHaveBeenCalledWith("collection-1");
  });
});
