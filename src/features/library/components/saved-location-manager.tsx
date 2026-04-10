"use client";

import { MapPinned, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { type LocationCategory, LOCATION_CATEGORIES } from "@/shared/config/location-catalog";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

import type { SavedLocationItem, UpsertSavedLocationInput } from "../schema";

interface SavedLocationManagerProps {
  locations: SavedLocationItem[];
  error?: string | null;
  isDeleting?: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  onDelete: (id: string) => Promise<{ deleted: boolean } | void> | void;
  onSave: (
    input: UpsertSavedLocationInput,
  ) => Promise<SavedLocationItem | void> | SavedLocationItem | void;
}

interface SavedLocationDraft {
  allSpies: boolean;
  category: LocationCategory;
  id?: string;
  name: string;
  roles: string[];
}

function createEmptyDraft(): SavedLocationDraft {
  return {
    name: "",
    category: LOCATION_CATEGORIES[0],
    allSpies: false,
    roles: ["", ""],
  };
}

function createDraftFromLocation(location: SavedLocationItem): SavedLocationDraft {
  return {
    id: location.id,
    name: location.name,
    category: location.category,
    allSpies: location.allSpies,
    roles: location.roles.length > 0 ? location.roles.map((role) => role.name) : [],
  };
}

function normalizeRoles(roles: string[]): string[] {
  return roles.map((role) => role.trim()).filter(Boolean);
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function SavedLocationManager({
  locations,
  error,
  isDeleting = false,
  isLoading = false,
  isSaving = false,
  onDelete,
  onSave,
}: SavedLocationManagerProps) {
  const firstLocation = locations.at(0);
  const [draft, setDraft] = useState<SavedLocationDraft>(() =>
    firstLocation ? createDraftFromLocation(firstLocation) : createEmptyDraft(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(firstLocation?.id ?? null);

  const selectedLocation =
    selectedId === null ? null : (locations.find((location) => location.id === selectedId) ?? null);
  const draftId = draft.id;

  function handleSelectLocation(location: SavedLocationItem) {
    setSelectedId(location.id);
    setDraft(createDraftFromLocation(location));
  }

  function handleCreateNew() {
    setSelectedId(null);
    setDraft(createEmptyDraft());
  }

  function handleRoleChange(index: number, value: string) {
    setDraft((previous) => {
      const nextRoles = [...previous.roles];
      nextRoles[index] = value;
      return { ...previous, roles: nextRoles };
    });
  }

  function handleAddRole() {
    setDraft((previous) => ({ ...previous, roles: [...previous.roles, ""] }));
  }

  function handleRemoveRole(index: number) {
    setDraft((previous) => ({
      ...previous,
      roles: previous.roles.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  async function handleDelete() {
    if (!draftId) {
      return;
    }

    const fallbackLocation = locations.find((location) => location.id !== draftId) ?? null;
    await onDelete(draftId);
    setSelectedId(fallbackLocation?.id ?? null);
    setDraft(fallbackLocation ? createDraftFromLocation(fallbackLocation) : createEmptyDraft());
  }

  async function handleSubmit() {
    const savedLocation = await onSave({
      ...(draft.id ? { id: draft.id } : {}),
      name: draft.name.trim(),
      category: draft.category,
      allSpies: draft.allSpies,
      roles: normalizeRoles(draft.roles),
    });

    if (savedLocation) {
      setSelectedId(savedLocation.id);
      setDraft(createDraftFromLocation(savedLocation));
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-white/45 uppercase">
              Saved locations
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              Build your own role packs
            </h2>
          </div>
          <Button
            className="rounded-full bg-white/90 text-black hover:bg-white"
            size="sm"
            onClick={handleCreateNew}
          >
            <Plus className="size-4" />
            New saved location
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center text-sm text-white/55">
            Loading your saved locations…
          </div>
        ) : locations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60">
              <MapPinned className="size-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">No saved locations yet</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Start with one clean custom location, then reuse it in future rounds and collections.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {locations.map((location) => {
              const isSelected = location.id === selectedId;
              return (
                <button
                  key={location.id}
                  type="button"
                  className={cn(
                    "w-full rounded-[24px] border px-4 py-4 text-left transition",
                    isSelected
                      ? "border-cyan-300/40 bg-cyan-300/10 shadow-[0_20px_50px_rgba(34,211,238,0.08)]"
                      : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]",
                  )}
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{location.name}</p>
                      <p className="mt-1 text-xs text-white/45">{location.category}</p>
                    </div>
                    <p className="text-xs text-white/35">{formatUpdatedAt(location.updatedAt)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {location.allSpies ? (
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-medium text-amber-100">
                        All spies
                      </span>
                    ) : (
                      location.roles.map((role) => (
                        <span
                          key={role.id}
                          className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/65"
                        >
                          {role.name}
                        </span>
                      ))
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-white/45 uppercase">
              Editor
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {selectedLocation ? "Edit saved location" : "Create a saved location"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Roles are now edited explicitly, not hidden behind a room-only placeholder flow.
            </p>
          </div>
          {draftId ? (
            <Button
              className="rounded-full"
              disabled={isDeleting}
              size="sm"
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          ) : null}
        </div>

        <div className="mt-6 space-y-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
            <div className="space-y-2">
              <Label htmlFor="saved-location-name">Location name</Label>
              <Input
                id="saved-location-name"
                placeholder="Secret Lab"
                value={draft.name}
                onChange={(event) =>
                  setDraft((previous) => ({ ...previous, name: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saved-location-category">Category</Label>
              <select
                id="saved-location-category"
                className="h-12 w-full rounded-xl border border-white/10 bg-[#141414] px-4 text-sm text-white transition outline-none focus:border-cyan-300/40 focus:ring-3 focus:ring-cyan-300/15"
                value={draft.category}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    category: event.target.value as LocationCategory,
                  }))
                }
              >
                {LOCATION_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="saved-location-all-spies">All spies</Label>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Use this when the round has no shared location and every player is a spy.
                </p>
              </div>
              <Switch
                checked={draft.allSpies}
                id="saved-location-all-spies"
                onCheckedChange={(checked) =>
                  setDraft((previous) => ({
                    ...previous,
                    allSpies: checked,
                    roles: checked ? [] : previous.roles.length > 0 ? previous.roles : ["", ""],
                  }))
                }
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Roles</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Add the role list players can receive at this location.
                </p>
              </div>
              <Button
                className="rounded-full"
                disabled={draft.allSpies}
                size="sm"
                variant="outline"
                onClick={handleAddRole}
              >
                <Plus className="size-4" />
                Add role
              </Button>
            </div>

            {draft.allSpies ? (
              <div className="mt-4 rounded-2xl border border-dashed border-amber-300/20 bg-amber-300/8 px-4 py-5 text-sm text-amber-100/90">
                All-spies locations skip role assignment, so no roles are required here.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {draft.roles.map((role, index) => (
                  <div key={`${draft.id ?? "draft"}-role-${index}`} className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`saved-location-role-${index}`}>Role {index + 1}</Label>
                      <Input
                        id={`saved-location-role-${index}`}
                        placeholder={index === 0 ? "Scientist" : "Guard"}
                        value={role}
                        onChange={(event) => handleRoleChange(index, event.target.value)}
                      />
                    </div>
                    <Button
                      aria-label={`Remove saved location row ${index + 1}`}
                      className="mt-8 rounded-full"
                      disabled={draft.roles.length <= 1}
                      size="icon"
                      variant="outline"
                      onClick={() => handleRemoveRole(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5">
            <p className="text-sm text-white/45">
              Saved locations are user-owned, reusable, and ready for future collection import.
            </p>
            <Button className="rounded-full px-6" disabled={isSaving} onClick={handleSubmit}>
              {isSaving ? "Saving…" : "Save location"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
