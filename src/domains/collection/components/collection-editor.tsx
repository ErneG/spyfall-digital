"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Separator } from "@/shared/ui/separator";

import {
  addLocationToCollection,
  getCollection,
  getSavedLocationImports,
  importSavedLocationToCollection,
  removeLocationFromCollection,
  updateCollection,
} from "../actions";

import {
  AddLocationForm,
  CollectionLocationRow,
  SavedLocationImportList,
} from "./collection-editor-parts";

import type { CollectionDetail, SavedLocationImportItem } from "../schema";

interface CollectionEditorProps {
  collectionId: string;
}

export function CollectionEditor({ collectionId }: CollectionEditorProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savedLocations, setSavedLocations] = useState<SavedLocationImportItem[]>([]);
  const [importingSavedLocationId, setImportingSavedLocationId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    const loadCollection = async () => {
      const [collectionResult, savedLocationsResult] = await Promise.all([
        getCollection(collectionId),
        getSavedLocationImports(),
      ]);
      if (cancelled) {
        return;
      }
      if (collectionResult.success) {
        setCollection(collectionResult.data);
        setNameValue(collectionResult.data.name);
      }
      if (savedLocationsResult.success) {
        setSavedLocations(savedLocationsResult.data);
      }
      setLoading(false);
    };
    void loadCollection();
    return () => {
      cancelled = true;
    };
  }, [collectionId, isAuthenticated, authLoading, router]);

  const handleBack = useCallback(() => router.push("/collections"), [router]);

  const handleSaveName = useCallback(async () => {
    if (!nameValue.trim() || nameValue === collection?.name) {
      setEditingName(false);
      return;
    }
    const result = await updateCollection({ id: collectionId, name: nameValue.trim() });
    if (result.success) {
      setCollection((previous) => (previous ? { ...previous, name: nameValue.trim() } : previous));
    }
    setEditingName(false);
  }, [nameValue, collection?.name, collectionId]);

  const handleAddLocation = useCallback(
    async (name: string, roles: string[], allSpies: boolean) => {
      const result = await addLocationToCollection({
        collectionId,
        name,
        roles,
        allSpies,
      });
      if (result.success) {
        setCollection((previous) =>
          previous ? { ...previous, locations: [...previous.locations, result.data] } : previous,
        );
      }
    },
    [collectionId],
  );

  const handleRemoveLocation = useCallback(async (locationId: string) => {
    const result = await removeLocationFromCollection({ locationId });
    if (result.success) {
      setCollection((previous) =>
        previous
          ? { ...previous, locations: previous.locations.filter((l) => l.id !== locationId) }
          : previous,
      );
    }
  }, []);

  const handleImportSavedLocation = useCallback(
    async (savedLocationId: string) => {
      setImportingSavedLocationId(savedLocationId);
      const result = await importSavedLocationToCollection({ collectionId, savedLocationId });
      if (result.success) {
        setCollection((previous) =>
          previous ? { ...previous, locations: [...previous.locations, result.data] } : previous,
        );
      }
      setImportingSavedLocationId(null);
    },
    [collectionId],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setNameValue(e.target.value),
    [],
  );

  const handleStartEditing = useCallback(() => setEditingName(true), []);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="bg-surface-2 size-8 animate-pulse rounded-full" />
      </div>
    );
  }

  if (!collection) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-muted-foreground">Collection not found</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-1 items-start justify-center bg-black p-4 pt-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={handleBack} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          {editingName ? (
            <div className="flex flex-1 gap-2">
              <Input value={nameValue} onChange={handleNameChange} maxLength={50} autoFocus />
              <Button size="sm" onClick={handleSaveName}>
                Save
              </Button>
            </div>
          ) : (
            <button onClick={handleStartEditing} className="flex-1 text-left">
              <h1 className="text-xl font-bold text-white">{collection.name}</h1>
            </button>
          )}
        </div>

        {/* Locations */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Locations ({collection.locations.length})
            </h2>
          </div>

          <div className="space-y-2">
            {collection.locations.map((loc) => (
              <CollectionLocationRow key={loc.id} location={loc} onRemove={handleRemoveLocation} />
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Import from saved locations</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Pull reusable saved locations into this collection as curated snapshots.
              </p>
            </div>
            <SavedLocationImportList
              existingLocationNames={collection.locations.map((location) => location.name)}
              importingId={importingSavedLocationId}
              onImport={handleImportSavedLocation}
              savedLocations={savedLocations}
            />
          </div>

          <Separator />

          <AddLocationForm onAdd={handleAddLocation} />
        </section>
      </div>
    </main>
  );
}
