import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { type PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { libraryCollectionKeys, useLibraryCollections } from "./use-library-collections";

const { getCollections, useAuth } = vi.hoisted(() => ({
  getCollections: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("@/entities/library/actions", () => ({
  getCollections,
}));

vi.mock("@/entities/auth/use-auth", () => ({
  useAuth,
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useLibraryCollections", () => {
  beforeEach(() => {
    getCollections.mockReset();
    useAuth.mockReset();

    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      signOut: vi.fn(),
      user: null,
    });
  });

  it("does not surface cached collections after sign-out", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      signOut: vi.fn(),
      user: null,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    queryClient.setQueryData(libraryCollectionKeys.all, {
      collections: [
        {
          id: "collection-1",
          name: "Night Shift",
          description: null,
          locationCount: 4,
          createdAt: "2026-04-11T10:00:00.000Z",
        },
      ],
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useLibraryCollections(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.collections).toEqual([]);
  });
});
