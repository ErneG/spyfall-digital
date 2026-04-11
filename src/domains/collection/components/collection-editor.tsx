"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import {
  getCollection,
  updateCollection,
  addLocationToCollection,
  removeLocationFromCollection,
} from "../actions";

import { CollectionEditorAddLocationForm } from "./collection-editor-add-location-form";
import { CollectionEditorLocationRow } from "./collection-editor-location-row";

import type { CollectionDetail } from "../schema";

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

  useEffect(() => {
    let cancelled = false;

    const loadCollection = async () => {
      if (authLoading) {
        return;
      }
      if (!isAuthenticated) {
        router.replace("/");
        return;
      }

      const result = await getCollection(collectionId);
      if (cancelled) {
        return;
      }
      if (result.success) {
        setCollection(result.data);
        setNameValue(result.data.name);
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
        previous ? { ...previous, locations: previous.locations.filter((l) => l.id !== locationId) } : previous,
      );
    }
  }, []);

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

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Locations ({collection.locations.length})
            </h2>
          </div>

          <div className="space-y-2">
            {collection.locations.map((loc) => (
              <CollectionEditorLocationRow key={loc.id} location={loc} onRemove={handleRemoveLocation} />
            ))}
          </div>

          <div className="pt-1">
            <CollectionEditorAddLocationForm onAdd={handleAddLocation} />
          </div>
        </section>
      </div>
    </main>
  );
}
