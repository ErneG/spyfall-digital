export const LIBRARY_ROUTE = "/library";
export const LIBRARY_COLLECTIONS_ROUTE = "/library/collections";

export function getLibraryCollectionRoute(collectionId: string): string {
  return `${LIBRARY_COLLECTIONS_ROUTE}/${collectionId}`;
}
