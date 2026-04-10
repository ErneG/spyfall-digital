import { z } from "zod/v4";

// ─── Collection List Item ────────────────────────────────────

export const collectionListItem = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  locationCount: z.number(),
  createdAt: z.string(),
});
export type CollectionListItem = z.infer<typeof collectionListItem>;

// ─── Collection Detail ───────────────────────────────────────

export const collectionLocationRole = z.object({
  id: z.string(),
  name: z.string(),
});
export type CollectionLocationRole = z.infer<typeof collectionLocationRole>;

export const collectionLocationItem = z.object({
  id: z.string(),
  name: z.string(),
  allSpies: z.boolean(),
  roles: z.array(collectionLocationRole),
});
export type CollectionLocationItem = z.infer<typeof collectionLocationItem>;

export const savedLocationImportItem = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  allSpies: z.boolean(),
  roles: z.array(collectionLocationRole),
});
export type SavedLocationImportItem = z.infer<typeof savedLocationImportItem>;

export const collectionDetail = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  locations: z.array(collectionLocationItem),
});
export type CollectionDetail = z.infer<typeof collectionDetail>;

// ─── Inputs ──────────────────────────────────────────────────

export const createCollectionInput = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(200).optional(),
});
export type CreateCollectionInput = z.infer<typeof createCollectionInput>;

export const updateCollectionInput = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).nullable().optional(),
});
export type UpdateCollectionInput = z.infer<typeof updateCollectionInput>;

export const addLocationInput = z.object({
  collectionId: z.string(),
  name: z.string().min(1, "Location name required").max(50),
  allSpies: z.boolean().optional(),
  roles: z.array(z.string().min(1).max(50)).min(1, "At least 1 role required").max(10),
});
export type AddLocationInput = z.infer<typeof addLocationInput>;

export const updateLocationInput = z.object({
  locationId: z.string(),
  name: z.string().min(1).max(50).optional(),
  allSpies: z.boolean().optional(),
});
export type UpdateLocationInput = z.infer<typeof updateLocationInput>;

export const removeLocationInput = z.object({
  locationId: z.string(),
});
export type RemoveLocationInput = z.infer<typeof removeLocationInput>;

export const importSavedLocationToCollectionInput = z.object({
  collectionId: z.string(),
  savedLocationId: z.string(),
});
export type ImportSavedLocationToCollectionInput = z.infer<
  typeof importSavedLocationToCollectionInput
>;

export const importCollectionInput = z.object({
  collectionId: z.string(),
  roomCode: z.string().min(1),
  playerId: z.string(),
});
export type ImportCollectionInput = z.infer<typeof importCollectionInput>;
