"use client";

import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

import type { CustomLocationItem, LocationItem } from "@/domains/location/schema";

interface RoleDraft {
  id: string;
  value: string;
}

let roomRoleDraftSeed = 0;

function createRoleDraft(value = ""): RoleDraft {
  roomRoleDraftSeed += 1;

  return {
    id: `room-location-role-draft-${roomRoleDraftSeed}`,
    value,
  };
}

export const LocationButton = memo(function LocationButton({
  id,
  name,
  selected,
  onToggle,
}: {
  id: string;
  name: string;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const { translateLocation } = useTranslation();
  const handleClick = useCallback(() => {
    onToggle(id);
  }, [onToggle, id]);
  return (
    <button
      onClick={handleClick}
      className={`rounded-2xl border px-3 py-2 text-left text-xs transition ${
        selected
          ? "border-sky-200 bg-sky-50 text-sky-900 shadow-[0_12px_24px_rgba(186,230,253,0.2)]"
          : "border-slate-200 bg-slate-100/80 text-slate-500"
      }`}
    >
      {translateLocation(name)}
    </button>
  );
});

export const LocationGroup = memo(function LocationGroup({
  title,
  locations,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  title: string;
  locations: LocationItem[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  const { t } = useTranslation();
  const selected = useMemo(() => locations.filter((l) => l.selected).length, [locations]);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-950">
          {title}{" "}
          <span className="text-slate-500">
            ({selected}/{locations.length})
          </span>
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="h-8 rounded-full px-3 text-xs text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
          >
            {t.locationSettings.all}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="h-8 rounded-full px-3 text-xs text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
          >
            {t.locationSettings.none}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {locations.map((loc) => (
          <LocationButton
            key={loc.id}
            id={loc.id}
            name={loc.name}
            selected={loc.selected}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
});

export const CustomLocationRow = memo(function CustomLocationRow({
  location,
  onToggle,
  onEdit,
  onDelete,
}: {
  location: CustomLocationItem;
  onToggle: (id: string, checked: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const handleToggle = useCallback(
    (checked: boolean) => {
      onToggle(location.id, checked);
    },
    [onToggle, location.id],
  );
  const handleDelete = useCallback(() => {
    void onDelete(location.id);
  }, [onDelete, location.id]);
  const handleEdit = useCallback(() => {
    onEdit(location.id);
  }, [onEdit, location.id]);

  const roleSummary = location.allSpies
    ? "No shared location roles required"
    : location.roles.map((role) => role.name).join(", ");

  return (
    <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
      <div className="flex flex-wrap items-start gap-3">
        <div className="pt-1">
          <Switch checked={location.selected} onCheckedChange={handleToggle} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">{location.name}</p>
            {location.allSpies ? (
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-[11px] text-amber-800"
              >
                All Spies
              </Badge>
            ) : null}
            {location.selected ? (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700"
              >
                Included
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-100 text-[11px] text-slate-500"
              >
                Excluded
              </Badge>
            )}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">{roleSummary}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            aria-label={`Edit ${location.name}`}
            className="rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            size="icon-sm"
            variant="outline"
            onClick={handleEdit}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            aria-label={`Delete ${location.name}`}
            className="rounded-full"
            size="icon-sm"
            variant="ghost"
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5 text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  );
});

interface CustomLocationEditorCardProps {
  mode: "create" | "edit";
  initialLocation?: CustomLocationItem | null;
  onCancel: () => void;
  onSave: (input: {
    id?: string;
    name: string;
    roles: string[];
    allSpies: boolean;
  }) => Promise<void> | void;
}

interface CustomLocationDraft {
  allSpies: boolean;
  id?: string;
  name: string;
  roles: RoleDraft[];
}

function createCustomLocationDraft(
  initialLocation?: CustomLocationItem | null,
): CustomLocationDraft {
  if (!initialLocation) {
    return {
      name: "",
      allSpies: false,
      roles: [createRoleDraft()],
    };
  }

  return {
    id: initialLocation.id,
    name: initialLocation.name,
    allSpies: initialLocation.allSpies,
    roles:
      initialLocation.roles.length > 0
        ? initialLocation.roles.map((role) => createRoleDraft(role.name))
        : [],
  };
}

export const CustomLocationEditorCard = memo(function CustomLocationEditorCard({
  mode,
  initialLocation,
  onCancel,
  onSave,
}: CustomLocationEditorCardProps) {
  const [draft, setDraft] = useState<CustomLocationDraft>(() =>
    createCustomLocationDraft(initialLocation),
  );

  const handleRoleChange = useCallback((roleId: string, value: string) => {
    setDraft((previous) => ({
      ...previous,
      roles: previous.roles.map((role) => (role.id === roleId ? { ...role, value } : role)),
    }));
  }, []);

  const handleAddRole = useCallback(() => {
    setDraft((previous) => ({ ...previous, roles: [...previous.roles, createRoleDraft()] }));
  }, []);

  const handleRemoveRole = useCallback((roleId: string) => {
    setDraft((previous) => ({
      ...previous,
      roles: previous.roles.filter((role) => role.id !== roleId),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    const normalizedRoles = draft.roles.map((role) => role.value.trim()).filter(Boolean);
    if (!draft.name.trim()) {
      return;
    }
    if (!draft.allSpies && normalizedRoles.length === 0) {
      return;
    }

    await onSave({
      ...(draft.id ? { id: draft.id } : {}),
      name: draft.name.trim(),
      roles: draft.allSpies ? [] : normalizedRoles,
      allSpies: draft.allSpies,
    });
  }, [draft, onSave]);

  return (
    <div className="rounded-[28px] border border-sky-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(240,249,255,0.9))] p-5 shadow-[0_24px_70px_rgba(186,230,253,0.24)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
            {mode === "create" ? "New room location" : "Edit room location"}
          </p>
          <h4 className="mt-2 text-lg font-semibold text-slate-950">
            {mode === "create" ? "Add a custom room location" : "Update this room location"}
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Author the name and role list directly instead of creating placeholder entries.
          </p>
        </div>
        <Button
          className="rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
          size="sm"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>

      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="custom-location-name">Location Name</Label>
          <Input
            id="custom-location-name"
            placeholder="Secret Lab"
            value={draft.name}
            className="border-white/75 bg-white text-slate-950 placeholder:text-slate-400"
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, name: event.target.value }))
            }
          />
        </div>

        <div className="rounded-[24px] border border-white/80 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label htmlFor="custom-location-all-spies">All Spies</Label>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use this when every player should receive a spy role and no shared location exists.
              </p>
            </div>
            <Switch
              checked={draft.allSpies}
              id="custom-location-all-spies"
              onCheckedChange={(checked) =>
                setDraft((previous) => ({
                  ...previous,
                  allSpies: checked,
                  roles: checked
                    ? []
                    : previous.roles.length > 0
                      ? previous.roles
                      : [createRoleDraft()],
                }))
              }
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/80 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Roles</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add each role explicitly so the room can show a real preview before the round
                starts.
              </p>
            </div>
            <Button
              className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
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
            <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-800">
              All-spies locations do not need a role list.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {draft.roles.map((role, index) => (
                <div key={role.id} className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`custom-location-role-${index}`}>Role {index + 1}</Label>
                    <Input
                      id={`custom-location-role-${index}`}
                      placeholder={index === 0 ? "Scientist" : "Guard"}
                      value={role.value}
                      className="border-white/75 bg-white text-slate-950 placeholder:text-slate-400"
                      onChange={(event) => handleRoleChange(role.id, event.target.value)}
                    />
                  </div>
                  <Button
                    aria-label={`Remove role ${index + 1}`}
                    className="mt-8 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    disabled={draft.roles.length <= 1}
                    size="icon"
                    variant="outline"
                    onClick={() => handleRemoveRole(role.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Button
            className="rounded-full border border-slate-950/5 bg-slate-950 px-6 text-white hover:bg-slate-900"
            onClick={handleSave}
          >
            {mode === "create" ? "Save Custom Location" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
});

export const CategoryGroupSection = memo(function CategoryGroupSection({
  category,
  locations,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  category: string;
  locations: LocationItem[];
  onToggle: (id: string) => void;
  onSelectAll: (category: string) => void;
  onDeselectAll: (category: string) => void;
}) {
  const handleSelectAll = useCallback(() => {
    onSelectAll(category);
  }, [onSelectAll, category]);
  const handleDeselectAll = useCallback(() => {
    onDeselectAll(category);
  }, [onDeselectAll, category]);

  const { translateCategory } = useTranslation();

  return (
    <LocationGroup
      title={translateCategory(category)}
      locations={locations}
      onToggle={onToggle}
      onSelectAll={handleSelectAll}
      onDeselectAll={handleDeselectAll}
    />
  );
});

export const LocationFilterInput = memo(function LocationFilterInput({
  filter,
  onFilterChange,
  onClear,
}: {
  filter: string;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder={t.locationSettings.filter}
        value={filter}
        onChange={onFilterChange}
        className="rounded-2xl border-white/70 bg-white/80 pl-9 text-slate-950 placeholder:text-slate-400"
      />
      {filter && (
        <button
          onClick={onClear}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
