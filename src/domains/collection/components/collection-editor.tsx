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
      <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]">
        <div className="size-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    );
  }

  if (!collection) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]">
        <p className="text-slate-500">Collection not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.62)_26%,transparent_52%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.55),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)] px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <section className="rounded-[36px] border border-white/80 bg-white/68 p-5 shadow-[0_40px_120px_rgba(148,163,184,0.22)] backdrop-blur-2xl sm:p-7">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleBack}
              aria-label="Back"
              className="rounded-full text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Collection editor
              </p>
              {editingName ? (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={nameValue}
                    onChange={handleNameChange}
                    maxLength={50}
                    autoFocus
                    className="border-white/75 bg-white text-slate-950 placeholder:text-slate-400"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    className="rounded-full border border-slate-950/5 bg-slate-950 px-5 text-white hover:bg-slate-900"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <button onClick={handleStartEditing} className="mt-2 flex-1 text-left">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                    {collection.name}
                  </h1>
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
            Collections are now curated snapshot packs. Import saved locations from the library or
            add manual room-only entries with explicit role rows.
          </p>

          <section className="mt-8 space-y-6">
            <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    Current locations
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                    {collection.locations.length} location
                    {collection.locations.length === 1 ? "" : "s"} in this collection
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {collection.locations.map((loc) => (
                  <CollectionLocationRow
                    key={loc.id}
                    location={loc}
                    onRemove={handleRemoveLocation}
                  />
                ))}
              </div>
            </div>

            <Separator className="bg-slate-200/80" />

            <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Library imports
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Import from saved locations
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Pull reusable saved locations into this collection as curated snapshots.
                </p>
              </div>
              <div className="mt-5">
                <SavedLocationImportList
                  existingLocationNames={collection.locations.map((location) => location.name)}
                  importingId={importingSavedLocationId}
                  onImport={handleImportSavedLocation}
                  savedLocations={savedLocations}
                />
              </div>
            </div>

            <Separator className="bg-slate-200/80" />

            <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Manual entry
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Add a collection-only location
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use this when you want a location that only lives inside this curated pack.
                </p>
              </div>
              <div className="mt-5">
                <AddLocationForm onAdd={handleAddLocation} />
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
