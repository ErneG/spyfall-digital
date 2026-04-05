"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { Switch } from "@/shared/ui/switch";

import {
  getCollection,
  updateCollection,
  addLocationToCollection,
  removeLocationFromCollection,
} from "../actions";

import type { CollectionDetail, CollectionLocationItem } from "../schema";

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
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    getCollection(collectionId).then((result) => {
      if (result.success) {
        setCollection(result.data);
        setNameValue(result.data.name);
      }
      setLoading(false);
    });
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
              <LocationRow key={loc.id} location={loc} onRemove={handleRemoveLocation} />
            ))}
          </div>

          <Separator />

          <AddLocationForm onAdd={handleAddLocation} />
        </section>
      </div>
    </main>
  );
}

// ─── Location Row ────────────────────────────────────────────

interface LocationRowProps {
  location: CollectionLocationItem;
  onRemove: (id: string) => void;
}

const LocationRow = memo(function LocationRow({ location, onRemove }: LocationRowProps) {
  const handleRemove = useCallback(() => onRemove(location.id), [onRemove, location.id]);

  return (
    <div className="bg-surface-1 flex items-center gap-3 rounded-xl p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{location.name}</span>
          {location.allSpies && <Badge variant="destructive">All Spies</Badge>}
        </div>
        <p className="text-muted-foreground text-xs">
          {location.roles.map((r) => r.name).join(", ")}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleRemove}
        aria-label={`Remove ${location.name}`}
      >
        <Trash2 className="text-muted-foreground size-3.5" />
      </Button>
    </div>
  );
});

// ─── Add Location Form ───────────────────────────────────────

interface AddLocationFormProps {
  onAdd: (name: string, roles: string[], allSpies: boolean) => void;
}

const AddLocationForm = memo(function AddLocationForm({ onAdd }: AddLocationFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [rolesText, setRolesText] = useState("");
  const [allSpies, setAllSpies] = useState(false);

  const handleToggleExpanded = useCallback(() => setExpanded((previous) => !previous), []);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      return;
    }
    const roles = rolesText
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    if (roles.length === 0) {
      return;
    }
    onAdd(name.trim(), roles, allSpies);
    setName("");
    setRolesText("");
    setAllSpies(false);
  }, [name, rolesText, allSpies, onAdd]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
    [],
  );
  const handleRolesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setRolesText(e.target.value),
    [],
  );
  const handleAllSpiesChange = useCallback((checked: boolean) => setAllSpies(checked), []);

  if (!expanded) {
    return (
      <Button variant="outline" className="w-full gap-2" onClick={handleToggleExpanded}>
        <Plus className="size-4" />
        Add Location
      </Button>
    );
  }

  return (
    <div className="bg-surface-1 space-y-3 rounded-xl p-3">
      <div className="space-y-2">
        <Label htmlFor="loc-name">Location Name</Label>
        <Input
          id="loc-name"
          value={name}
          onChange={handleNameChange}
          placeholder="e.g. Secret Lab"
          maxLength={50}
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="loc-roles">Roles (comma-separated)</Label>
        <Input
          id="loc-roles"
          value={rolesText}
          onChange={handleRolesChange}
          placeholder="e.g. Scientist, Guard, Director"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="all-spies">All Spies</Label>
        <Switch id="all-spies" checked={allSpies} onCheckedChange={handleAllSpiesChange} />
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={handleToggleExpanded}>
          Cancel
        </Button>
        <Button size="sm" className="flex-1" onClick={handleSubmit}>
          Add
        </Button>
      </div>
    </div>
  );
});
