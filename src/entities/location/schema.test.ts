import { describe, expect, it } from "vitest";

import * as domainSchema from "@/domains/location/schema";

import {
  createCustomLocationInput,
  customLocationSchema,
  deleteCustomLocationInput,
  locationItemSchema,
  locationsResponseSchema,
  updateCustomLocationInput,
  updateLocationsInput,
} from "./schema";

describe("location entity schema", () => {
  it("re-exports the room location schemas", () => {
    expect(locationItemSchema).toBe(domainSchema.locationItemSchema);
    expect(customLocationSchema).toBe(domainSchema.customLocationSchema);
    expect(locationsResponseSchema).toBe(domainSchema.locationsResponseSchema);
    expect(updateLocationsInput).toBe(domainSchema.updateLocationsInput);
    expect(createCustomLocationInput).toBe(domainSchema.createCustomLocationInput);
    expect(updateCustomLocationInput).toBe(domainSchema.updateCustomLocationInput);
    expect(deleteCustomLocationInput).toBe(domainSchema.deleteCustomLocationInput);
  });
});
