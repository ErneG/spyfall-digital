"use client";

import { useQuery } from "@tanstack/react-query";

import { getCollections } from "@/domains/collection/actions";
import { unwrapAction } from "@/shared/lib/unwrap-action";

import type { CollectionListItem } from "@/domains/collection/schema";

const NOT_AUTHENTICATED_ERROR = "Not authenticated";

export const libraryCollectionKeys = {
  all: ["library", "collections"] as const,
};

interface LibraryCollectionsQueryState {
  collections: CollectionListItem[];
  isAuthenticated: boolean;
}

async function fetchLibraryCollections(): Promise<LibraryCollectionsQueryState> {
  const result = await getCollections();
  if (!result.success) {
    if (result.error === NOT_AUTHENTICATED_ERROR) {
      return {
        collections: [],
        isAuthenticated: false,
      };
    }

    throw new Error(result.error);
  }

  return {
    collections: unwrapAction(result),
    isAuthenticated: true,
  };
}

export function useLibraryCollections() {
  const collectionsQuery = useQuery({
    queryKey: libraryCollectionKeys.all,
    queryFn: fetchLibraryCollections,
  });

  return {
    collections: collectionsQuery.data?.collections ?? [],
    error: collectionsQuery.isError ? collectionsQuery.error.message : null,
    isAuthenticated: collectionsQuery.data?.isAuthenticated ?? true,
    isLoading: collectionsQuery.isLoading,
  };
}
