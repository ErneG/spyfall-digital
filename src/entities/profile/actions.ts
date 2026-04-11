"use server";

import {
  deleteNameFromHistory as domainDeleteNameFromHistory,
  getNameHistory as domainGetNameHistory,
  getNameSuggestions as domainGetNameSuggestions,
  getProfile as domainGetProfile,
  updateProfile as domainUpdateProfile,
} from "@/domains/profile/actions";

export async function deleteNameFromHistory(
  ...args: Parameters<typeof domainDeleteNameFromHistory>
) {
  return domainDeleteNameFromHistory(...args);
}

export async function getNameHistory(...args: Parameters<typeof domainGetNameHistory>) {
  return domainGetNameHistory(...args);
}

export async function getNameSuggestions(...args: Parameters<typeof domainGetNameSuggestions>) {
  return domainGetNameSuggestions(...args);
}

export async function getProfile(...args: Parameters<typeof domainGetProfile>) {
  return domainGetProfile(...args);
}

export async function updateProfile(...args: Parameters<typeof domainUpdateProfile>) {
  return domainUpdateProfile(...args);
}
