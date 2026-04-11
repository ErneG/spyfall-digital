import { z } from "zod/v4";

export const profileOutput = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
  image: z.string().nullable(),
  collectionCount: z.number(),
});
export type ProfileOutput = z.infer<typeof profileOutput>;

export const updateProfileInput = z.object({
  displayName: z.string().min(1, "Name is required").max(30, "Name too long"),
});
export type UpdateProfileInput = z.infer<typeof updateProfileInput>;

export const nameHistoryItem = z.object({
  id: z.string(),
  name: z.string(),
  usedAt: z.string(),
});
export type NameHistoryItem = z.infer<typeof nameHistoryItem>;

export const deleteNameInput = z.object({
  name: z.string().min(1),
});
export type DeleteNameInput = z.infer<typeof deleteNameInput>;
