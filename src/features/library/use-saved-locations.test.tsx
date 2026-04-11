import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { type PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { libraryKeys, useSavedLocations } from "./use-saved-locations";

const { deleteSavedLocation, getSavedLocations, upsertSavedLocation, useAuth } = vi.hoisted(() => ({
  deleteSavedLocation: vi.fn(),
  getSavedLocations: vi.fn(),
  upsertSavedLocation: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("@/features/library/actions", () => ({
  deleteSavedLocation,
  getSavedLocations,
  upsertSavedLocation,
}));

vi.mock("@/entities/auth/use-auth", () => ({
  useAuth,
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useSavedLocations", () => {
  beforeEach(() => {
    deleteSavedLocation.mockReset();
    getSavedLocations.mockReset();
    upsertSavedLocation.mockReset();
    useAuth.mockReset();

    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      signOut: vi.fn(),
      user: null,
    });
  });

  it("does not surface cached saved locations after sign-out", () => {
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
    queryClient.setQueryData(libraryKeys.savedLocations(), {
      isAuthenticated: true,
      locations: [
        {
          id: "saved-1",
          name: "Airplane",
          category: "Travel",
          allSpies: false,
          roles: ["Pilot", "Co-Pilot"],
          createdAt: "2026-04-11T10:00:00.000Z",
          updatedAt: "2026-04-11T10:00:00.000Z",
        },
      ],
    });

    const { result } = renderHook(() => useSavedLocations(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.locations).toEqual([]);
  });
});
