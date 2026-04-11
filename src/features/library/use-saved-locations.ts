"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/entities/auth/use-auth";
import {
  deleteSavedLocation,
  getSavedLocations,
  upsertSavedLocation,
} from "@/features/library/actions";
import { unwrapAction } from "@/shared/lib/unwrap-action";

import type { SavedLocationItem, UpsertSavedLocationInput } from "./schema";

const NOT_AUTHENTICATED_ERROR = "Not authenticated";

export const libraryKeys = {
  all: ["library"] as const,
  savedLocations: () => ["library", "saved-locations"] as const,
} as const;

interface SavedLocationsQueryState {
  isAuthenticated: boolean;
  locations: SavedLocationItem[];
}

async function fetchSavedLocations(): Promise<SavedLocationsQueryState> {
  const result = await getSavedLocations();
  if (!result.success) {
    if (result.error === NOT_AUTHENTICATED_ERROR) {
      return {
        locations: [],
        isAuthenticated: false,
      };
    }
    throw new Error(result.error);
  }

  return {
    locations: result.data.locations,
    isAuthenticated: true,
  };
}

export function useSavedLocations() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const savedLocationsQuery = useQuery({
    queryKey: libraryKeys.savedLocations(),
    queryFn: fetchSavedLocations,
    enabled: isAuthenticated,
  });

  const saveMutation = useMutation({
    mutationFn: async (input: UpsertSavedLocationInput) =>
      unwrapAction(await upsertSavedLocation(input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: libraryKeys.savedLocations() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => unwrapAction(await deleteSavedLocation({ id })),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: libraryKeys.savedLocations() });
    },
  });

  return {
    error:
      saveMutation.error?.message ??
      deleteMutation.error?.message ??
      (isAuthenticated && savedLocationsQuery.isError ? savedLocationsQuery.error.message : null),
    isAuthenticated,
    isDeleting: deleteMutation.isPending,
    isLoading: isAuthLoading || (isAuthenticated && savedLocationsQuery.isLoading),
    isSaving: saveMutation.isPending,
    locations: isAuthenticated ? (savedLocationsQuery.data?.locations ?? []) : [],
    onDelete: deleteMutation.mutateAsync,
    onSave: saveMutation.mutateAsync,
  };
}
