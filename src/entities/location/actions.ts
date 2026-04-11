"use server";

import {
  createCustomLocation as domainCreateCustomLocation,
  deleteCustomLocation as domainDeleteCustomLocation,
  getLocations as domainGetLocations,
  updateCustomLocation as domainUpdateCustomLocation,
  updateLocationSelections as domainUpdateLocationSelections,
} from "@/domains/location/actions";

export async function createCustomLocation(...args: Parameters<typeof domainCreateCustomLocation>) {
  return domainCreateCustomLocation(...args);
}

export async function deleteCustomLocation(...args: Parameters<typeof domainDeleteCustomLocation>) {
  return domainDeleteCustomLocation(...args);
}

export async function getLocations(...args: Parameters<typeof domainGetLocations>) {
  return domainGetLocations(...args);
}

export async function updateCustomLocation(...args: Parameters<typeof domainUpdateCustomLocation>) {
  return domainUpdateCustomLocation(...args);
}

export async function updateLocationSelections(
  ...args: Parameters<typeof domainUpdateLocationSelections>
) {
  return domainUpdateLocationSelections(...args);
}
