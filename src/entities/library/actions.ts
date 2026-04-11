"use server";

import {
  addLocationToCollection as domainAddLocationToCollection,
  createCollection as domainCreateCollection,
  deleteCollection as domainDeleteCollection,
  getCollection as domainGetCollection,
  getCollections as domainGetCollections,
  getSavedLocationImports as domainGetSavedLocationImports,
  importSavedLocationToCollection as domainImportSavedLocationToCollection,
  removeLocationFromCollection as domainRemoveLocationFromCollection,
  updateCollection as domainUpdateCollection,
  updateCollectionLocation as domainUpdateCollectionLocation,
} from "@/domains/collection/actions";

export async function addLocationToCollection(
  ...args: Parameters<typeof domainAddLocationToCollection>
) {
  return domainAddLocationToCollection(...args);
}

export async function createCollection(...args: Parameters<typeof domainCreateCollection>) {
  return domainCreateCollection(...args);
}

export async function deleteCollection(...args: Parameters<typeof domainDeleteCollection>) {
  return domainDeleteCollection(...args);
}

export async function getCollection(...args: Parameters<typeof domainGetCollection>) {
  return domainGetCollection(...args);
}

export async function getCollections(...args: Parameters<typeof domainGetCollections>) {
  return domainGetCollections(...args);
}

export async function getSavedLocationImports(
  ...args: Parameters<typeof domainGetSavedLocationImports>
) {
  return domainGetSavedLocationImports(...args);
}

export async function importSavedLocationToCollection(
  ...args: Parameters<typeof domainImportSavedLocationToCollection>
) {
  return domainImportSavedLocationToCollection(...args);
}

export async function removeLocationFromCollection(
  ...args: Parameters<typeof domainRemoveLocationFromCollection>
) {
  return domainRemoveLocationFromCollection(...args);
}

export async function updateCollection(...args: Parameters<typeof domainUpdateCollection>) {
  return domainUpdateCollection(...args);
}

export async function updateCollectionLocation(
  ...args: Parameters<typeof domainUpdateCollectionLocation>
) {
  return domainUpdateCollectionLocation(...args);
}
