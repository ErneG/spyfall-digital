import { z } from "zod/v4";

import { DEFAULT_LOCATIONS, type DefaultLocation } from "@/entities/library/default-locations";
import { LOCATION_CATEGORIES, type LocationCategory } from "@/shared/config/location-catalog";

const DEFAULT_SOURCE_CATEGORIES = [...LOCATION_CATEGORIES] as [
  LocationCategory,
  ...LocationCategory[],
];

export const builtInContentSourceInput = z.object({
  kind: z.literal("built-in"),
  categories: z.array(z.enum(LOCATION_CATEGORIES)).min(1).default(DEFAULT_SOURCE_CATEGORIES),
});
export type BuiltInContentSourceInput = z.infer<typeof builtInContentSourceInput>;

export const collectionContentSourceInput = z.object({
  kind: z.literal("collection"),
  collectionId: z.string().min(1, "Collection is required"),
});
export type CollectionContentSourceInput = z.infer<typeof collectionContentSourceInput>;

export const contentSourceInput = z.discriminatedUnion("kind", [
  builtInContentSourceInput,
  collectionContentSourceInput,
]);
export type ContentSourceInput = z.infer<typeof contentSourceInput>;

export function getDefaultBuiltInSourceCategories(): LocationCategory[] {
  return [...LOCATION_CATEGORIES];
}

export function createBuiltInContentSource(
  categories: LocationCategory[] = getDefaultBuiltInSourceCategories(),
): BuiltInContentSourceInput {
  return builtInContentSourceInput.parse({
    kind: "built-in",
    categories: categories.length > 0 ? categories : getDefaultBuiltInSourceCategories(),
  });
}

export function createCollectionContentSource(collectionId: string): CollectionContentSourceInput {
  return collectionContentSourceInput.parse({
    kind: "collection",
    collectionId,
  });
}

export interface ContentSourceCollectionLocation {
  allSpies: boolean;
  name: string;
  roles: Array<{
    name: string;
  }>;
}

export interface ContentSourceCollectionDetail {
  name: string;
  locations: ContentSourceCollectionLocation[];
}

export interface ResolvedContentSourceLocation {
  allSpies: boolean;
  category: string;
  name: string;
  roles: string[];
}

interface ResolveContentSourceOptions {
  builtInLocations?: DefaultLocation[];
  collection?: ContentSourceCollectionDetail;
}

function normalizeBuiltInSourceCategories(categories: LocationCategory[]): LocationCategory[] {
  return categories.length > 0 ? categories : getDefaultBuiltInSourceCategories();
}

export function resolveBuiltInContentSourceLocations(
  categories: LocationCategory[],
  builtInLocations: DefaultLocation[] = DEFAULT_LOCATIONS,
): ResolvedContentSourceLocation[] {
  const normalizedCategories = normalizeBuiltInSourceCategories(categories);

  return builtInLocations
    .filter((location) => normalizedCategories.includes(location.category as LocationCategory))
    .map((location) => ({
      allSpies: false,
      category: location.category,
      name: location.name,
      roles: location.roles,
    }));
}

export function resolveCollectionContentSourceLocations(
  collection: ContentSourceCollectionDetail,
): ResolvedContentSourceLocation[] {
  return collection.locations.map((location) => ({
    allSpies: location.allSpies,
    category: collection.name,
    name: location.name,
    roles: location.roles.map((role) => role.name),
  }));
}

export function resolveContentSourceLocations(
  source: ContentSourceInput,
  options: ResolveContentSourceOptions = {},
): ResolvedContentSourceLocation[] {
  if (source.kind === "collection") {
    if (!options.collection) {
      return [];
    }

    return resolveCollectionContentSourceLocations(options.collection);
  }

  return resolveBuiltInContentSourceLocations(source.categories, options.builtInLocations);
}
