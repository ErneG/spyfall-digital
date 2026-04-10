import { describe, expect, it } from "vitest";

import * as domainActions from "@/domains/location/actions";

import {
  createCustomLocation,
  deleteCustomLocation,
  getLocations,
  updateCustomLocation,
  updateLocationSelections,
} from "./actions";

describe("location entity actions", () => {
  it("re-exports the room location actions", () => {
    expect(updateLocationSelections).toBe(domainActions.updateLocationSelections);
    expect(createCustomLocation).toBe(domainActions.createCustomLocation);
    expect(updateCustomLocation).toBe(domainActions.updateCustomLocation);
    expect(getLocations).toBe(domainActions.getLocations);
    expect(deleteCustomLocation).toBe(domainActions.deleteCustomLocation);
  });
});
