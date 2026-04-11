import { z } from "zod/v4";

import { LOCATION_CATEGORIES } from "@/shared/config/location-catalog";

const normalizedRolesSchema = z
  .array(z.string().max(50))
  .max(10)
  .transform((roles) => roles.map((role) => role.trim()).filter(Boolean));

export const savedLocationRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type SavedLocationRole = z.infer<typeof savedLocationRoleSchema>;

export const savedLocationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(LOCATION_CATEGORIES),
  allSpies: z.boolean(),
  roles: z.array(savedLocationRoleSchema),
  updatedAt: z.string(),
});
export type SavedLocationItem = z.infer<typeof savedLocationItemSchema>;

export const savedLocationsResponseSchema = z.object({
  locations: z.array(savedLocationItemSchema),
});
export type SavedLocationsResponse = z.infer<typeof savedLocationsResponseSchema>;

export const upsertSavedLocationInput = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Location name is required").max(50),
    category: z.enum(LOCATION_CATEGORIES),
    allSpies: z.boolean().default(false),
    roles: normalizedRolesSchema,
  })
  .superRefine((value, ctx) => {
    if (!value.allSpies && value.roles.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one role is required unless the location is all spies.",
        path: ["roles"],
      });
    }
  });
export type UpsertSavedLocationInput = z.infer<typeof upsertSavedLocationInput>;

export const deleteSavedLocationInput = z.object({
  id: z.string().min(1),
});
export type DeleteSavedLocationInput = z.infer<typeof deleteSavedLocationInput>;
