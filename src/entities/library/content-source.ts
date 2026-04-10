import { z } from "zod/v4";

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
