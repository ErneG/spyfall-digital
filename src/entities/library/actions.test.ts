import { beforeEach, describe, expect, it, vi } from "vitest";

const addLocationToCollection = vi.fn();
const createCollection = vi.fn();
const deleteCollection = vi.fn();
const getCollection = vi.fn();
const getCollections = vi.fn();
const getSavedLocationImports = vi.fn();
const importSavedLocationToCollection = vi.fn();
const removeLocationFromCollection = vi.fn();
const updateCollection = vi.fn();
const updateCollectionLocation = vi.fn();

vi.mock("@/domains/collection/actions", () => ({
  addLocationToCollection,
  createCollection,
  deleteCollection,
  getCollection,
  getCollections,
  getSavedLocationImports,
  importSavedLocationToCollection,
  removeLocationFromCollection,
  updateCollection,
  updateCollectionLocation,
}));

describe("library entity actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("delegates library server actions through the entity layer", async () => {
    addLocationToCollection.mockResolvedValue({ success: true, data: { id: "item-1" } });
    createCollection.mockResolvedValue({ success: true, data: { id: "collection-1" } });
    deleteCollection.mockResolvedValue({ success: true, data: { deleted: true } });
    getCollection.mockResolvedValue({ success: true, data: { id: "collection-1" } });
    getCollections.mockResolvedValue({ success: true, data: [] });
    getSavedLocationImports.mockResolvedValue({ success: true, data: [] });
    importSavedLocationToCollection.mockResolvedValue({ success: true, data: { id: "item-2" } });
    removeLocationFromCollection.mockResolvedValue({ success: true, data: { removed: true } });
    updateCollection.mockResolvedValue({ success: true, data: { id: "collection-1" } });
    updateCollectionLocation.mockResolvedValue({ success: true, data: { id: "item-1" } });

    const libraryActions = await import("./actions");

    await expect(
      libraryActions.addLocationToCollection({
        collectionId: "collection-1",
        name: "Dead Drop",
        roles: ["Courier"],
      }),
    ).resolves.toEqual({ success: true, data: { id: "item-1" } });
    await expect(libraryActions.createCollection({ name: "Favorites" })).resolves.toEqual({
      success: true,
      data: { id: "collection-1" },
    });
    await expect(libraryActions.deleteCollection("collection-1")).resolves.toEqual({
      success: true,
      data: { deleted: true },
    });
    await expect(libraryActions.getCollection("collection-1")).resolves.toEqual({
      success: true,
      data: { id: "collection-1" },
    });
    await expect(libraryActions.getCollections()).resolves.toEqual({
      success: true,
      data: [],
    });
    await expect(libraryActions.getSavedLocationImports()).resolves.toEqual({
      success: true,
      data: [],
    });
    await expect(
      libraryActions.importSavedLocationToCollection({
        collectionId: "collection-1",
        savedLocationId: "saved-1",
      }),
    ).resolves.toEqual({ success: true, data: { id: "item-2" } });
    await expect(
      libraryActions.removeLocationFromCollection({ locationId: "location-1" }),
    ).resolves.toEqual({ success: true, data: { removed: true } });
    await expect(
      libraryActions.updateCollection({ id: "collection-1", name: "Updated Favorites" }),
    ).resolves.toEqual({ success: true, data: { id: "collection-1" } });
    await expect(
      libraryActions.updateCollectionLocation({
        locationId: "location-1",
        name: "Updated name",
      }),
    ).resolves.toEqual({ success: true, data: { id: "item-1" } });
  });
});
