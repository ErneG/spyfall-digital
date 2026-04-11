import { z } from "zod/v4";

export const locationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  selected: z.boolean(),
});
export type LocationItem = z.infer<typeof locationItemSchema>;

export const customLocationRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const customLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  allSpies: z.boolean(),
  selected: z.boolean(),
  roles: z.array(customLocationRoleSchema),
});
export type CustomLocationItem = z.infer<typeof customLocationSchema>;

export const locationsResponseSchema = z.object({
  locations: z.array(locationItemSchema),
  customLocations: z.array(customLocationSchema),
});
export type LocationsResponse = z.infer<typeof locationsResponseSchema>;

export const updateLocationsInput = z.object({
  playerId: z.string().min(1),
  locationIds: z.array(z.string()),
});
export type UpdateLocationsInput = z.infer<typeof updateLocationsInput>;

export const createCustomLocationInput = z.object({
  playerId: z.string().min(1),
  name: z.string().min(1).max(50).default("New Location"),
  roles: z.array(z.string()).default(["Role 1", "Role 2", "Role 3"]),
  allSpies: z.boolean().default(false),
});
export type CreateCustomLocationInput = z.infer<typeof createCustomLocationInput>;

export const updateCustomLocationInput = z.object({
  playerId: z.string().min(1),
  locationId: z.string().min(1),
  name: z.string().min(1).max(50).optional(),
  roles: z.array(z.string()).optional(),
  allSpies: z.boolean().optional(),
  selected: z.boolean().optional(),
});
export type UpdateCustomLocationInput = z.infer<typeof updateCustomLocationInput>;

export const deleteCustomLocationInput = z.object({
  playerId: z.string().min(1),
  locationId: z.string().min(1),
});
export type DeleteCustomLocationInput = z.infer<typeof deleteCustomLocationInput>;

export const locationSeedSchema = z.object({
  name: z.string(),
  category: z.string(),
  roles: z.array(z.string()),
});
export type LocationSeed = z.infer<typeof locationSeedSchema>;
