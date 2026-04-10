"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getCollection, getCollections } from "@/domains/collection/actions";
import { type CollectionDetail, type CollectionListItem } from "@/entities/library/collection";
import {
  createBuiltInContentSource,
  createCollectionContentSource,
  type ContentSourceInput,
} from "@/entities/library/content-source";
import { DEFAULT_LOCATIONS } from "@/entities/library/default-locations";
import { type LocationCategory } from "@/shared/config/location-catalog";
import { unwrapAction } from "@/shared/lib/unwrap-action";
import { type LocationCatalogItem } from "@/shared/ui/location-catalog-preview";

async function fetchCollections(): Promise<CollectionListItem[]> {
  const result = await getCollections();
  return unwrapAction(result);
}

async function fetchCollectionDetail(collectionId: string): Promise<CollectionDetail> {
  const result = await getCollection(collectionId);
  return unwrapAction(result);
}

function resolveActiveCollectionId(
  collections: CollectionListItem[],
  selectedCollectionId: string | null,
): string | null {
  if (selectedCollectionId && collections.some((item) => item.id === selectedCollectionId)) {
    return selectedCollectionId;
  }

  return collections[0]?.id ?? null;
}

function buildPassAndPlaySource(
  sourceMode: "built-in" | "collection",
  categories: LocationCategory[],
  activeCollectionId: string | null,
): ContentSourceInput {
  if (sourceMode === "collection" && activeCollectionId) {
    return createCollectionContentSource(activeCollectionId);
  }

  return createBuiltInContentSource(categories);
}

function buildPreviewLocations(
  source: ContentSourceInput,
  categories: LocationCategory[],
  collection: CollectionDetail | undefined,
): LocationCatalogItem[] {
  if (source.kind === "collection") {
    if (!collection) {
      return [];
    }

    return collection.locations.map((location) => ({
      category: collection.name,
      name: location.name,
      roles: location.allSpies
        ? ["All players are spies"]
        : location.roles.map((role) => role.name),
    }));
  }

  return DEFAULT_LOCATIONS.filter((location) =>
    categories.includes(location.category as LocationCategory),
  );
}

function calculateTotalRoles(
  source: ContentSourceInput,
  previewLocations: LocationCatalogItem[],
  collection: CollectionDetail | undefined,
): number {
  if (source.kind === "collection") {
    return collection?.locations.reduce((sum, location) => sum + location.roles.length, 0) ?? 0;
  }

  return previewLocations.reduce((sum, location) => sum + location.roles.length, 0);
}

interface UsePassAndPlaySourcesOptions {
  authLoading: boolean;
  categories: LocationCategory[];
  isAuthenticated: boolean;
  selectedCollectionId: string | null;
  sourceMode: "built-in" | "collection";
}

export function usePassAndPlaySources({
  authLoading,
  categories,
  isAuthenticated,
  selectedCollectionId,
  sourceMode,
}: UsePassAndPlaySourcesOptions) {
  const collectionsQuery = useQuery({
    queryKey: ["pass-and-play", "collections"],
    queryFn: fetchCollections,
    enabled: isAuthenticated && !authLoading,
  });

  const availableCollections = useMemo(() => collectionsQuery.data ?? [], [collectionsQuery.data]);
  const activeCollectionId = useMemo(
    () => resolveActiveCollectionId(availableCollections, selectedCollectionId),
    [availableCollections, selectedCollectionId],
  );
  const source = useMemo(
    () => buildPassAndPlaySource(sourceMode, categories, activeCollectionId),
    [activeCollectionId, categories, sourceMode],
  );

  const collectionDetailQuery = useQuery({
    queryKey: ["pass-and-play", "collections", activeCollectionId ?? ""],
    queryFn: async () => {
      if (!activeCollectionId) {
        throw new Error("Collection is required");
      }

      return fetchCollectionDetail(activeCollectionId);
    },
    enabled: source.kind === "collection" && Boolean(activeCollectionId) && isAuthenticated,
  });

  const previewLocations = useMemo(
    () => buildPreviewLocations(source, categories, collectionDetailQuery.data),
    [categories, collectionDetailQuery.data, source],
  );
  const totalRoles = useMemo(
    () => calculateTotalRoles(source, previewLocations, collectionDetailQuery.data),
    [collectionDetailQuery.data, previewLocations, source],
  );

  return {
    activeCollectionId,
    availableCollections,
    collectionDetailQuery,
    collectionsQuery,
    previewLocations,
    source,
    totalRoles,
  };
}
