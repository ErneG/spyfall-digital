"use client";

import { Plus, Trash2 } from "lucide-react";
import { memo, useCallback, useState } from "react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

import type {
  CollectionLocationItem,
  SavedLocationImportItem,
} from "@/entities/library/collection";

interface RoleDraft {
  id: string;
  value: string;
}

let roleDraftSeed = 0;

function createRoleDraft(value = ""): RoleDraft {
  roleDraftSeed += 1;

  return {
    id: `collection-role-draft-${roleDraftSeed}`,
    value,
  };
}

interface CollectionLocationRowProps {
  location: CollectionLocationItem;
  onRemove: (id: string) => void;
}

export const CollectionLocationRow = memo(function CollectionLocationRow({
  location,
  onRemove,
}: CollectionLocationRowProps) {
  const handleRemove = useCallback(() => onRemove(location.id), [onRemove, location.id]);

  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-950">{location.name}</span>
          {location.allSpies ? (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-[11px] text-amber-800"
            >
              All Spies
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {location.roles.map((role) => role.name).join(", ")}
        </p>
      </div>
      <Button
        className="rounded-full"
        onClick={handleRemove}
        aria-label={`Remove ${location.name}`}
        size="icon-sm"
        variant="ghost"
      >
        <Trash2 className="size-3.5 text-slate-400" />
      </Button>
    </div>
  );
});

interface AddLocationFormProps {
  onAdd: (name: string, roles: string[], allSpies: boolean) => Promise<void>;
}

export const AddLocationForm = memo(function AddLocationForm({ onAdd }: AddLocationFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<RoleDraft[]>(() => [createRoleDraft()]);
  const [allSpies, setAllSpies] = useState(false);

  const handleToggleExpanded = useCallback(() => setExpanded((previous) => !previous), []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      return;
    }
    const normalizedRoles = roles.map((role) => role.value.trim()).filter(Boolean);
    if (!allSpies && normalizedRoles.length === 0) {
      return;
    }
    await onAdd(name.trim(), allSpies ? [] : normalizedRoles, allSpies);
    setName("");
    setRoles([createRoleDraft()]);
    setAllSpies(false);
  }, [allSpies, name, onAdd, roles]);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [],
  );
  const handleAllSpiesChange = useCallback((checked: boolean) => setAllSpies(checked), []);
  const handleRoleChange = useCallback((roleId: string, value: string) => {
    setRoles((previous) => {
      return previous.map((role) => (role.id === roleId ? { ...role, value } : role));
    });
  }, []);
  const handleAddRole = useCallback(() => {
    setRoles((previous) => [...previous, createRoleDraft()]);
  }, []);
  const handleRemoveRole = useCallback((roleId: string) => {
    setRoles((previous) => previous.filter((role) => role.id !== roleId));
  }, []);

  if (!expanded) {
    return (
      <Button
        variant="outline"
        className="w-full gap-2 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
        onClick={handleToggleExpanded}
      >
        <Plus className="size-4" />
        Add Location
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-[28px] border border-sky-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(240,249,255,0.9))] p-5 shadow-[0_24px_70px_rgba(186,230,253,0.24)]">
      <div className="space-y-2">
        <Label htmlFor="loc-name">Location Name</Label>
        <Input
          id="loc-name"
          value={name}
          onChange={handleNameChange}
          placeholder="e.g. Secret Lab"
          maxLength={50}
          autoFocus
          className="border-white/75 bg-white text-slate-950 placeholder:text-slate-400"
        />
      </div>
      <div className="rounded-[24px] border border-white/80 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>Roles</Label>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add each role explicitly so the collection preview stays trustworthy.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddRole}
            disabled={allSpies}
            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
          >
            <Plus className="size-4" />
            Add role
          </Button>
        </div>
        {allSpies ? (
          <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-800">
            All-spies locations do not need role assignments.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {roles.map((role, index) => (
              <div key={role.id} className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`loc-role-${index}`}>Role {index + 1}</Label>
                  <Input
                    id={`loc-role-${index}`}
                    value={role.value}
                    onChange={(event) => handleRoleChange(role.id, event.target.value)}
                    placeholder={index === 0 ? "Scientist" : "Guard"}
                    className="border-white/75 bg-white text-slate-950 placeholder:text-slate-400"
                  />
                </div>
                <Button
                  aria-label={`Remove role ${index + 1}`}
                  size="icon"
                  variant="outline"
                  className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                  disabled={roles.length <= 1}
                  onClick={() => handleRemoveRole(role.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-[24px] border border-white/80 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="all-spies">All Spies</Label>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use this when the collection location has no shared place and every player is a spy.
            </p>
          </div>
          <Switch id="all-spies" checked={allSpies} onCheckedChange={handleAllSpiesChange} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleExpanded}
          className="rounded-full text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-full border border-slate-950/5 bg-slate-950 text-white hover:bg-slate-900"
          onClick={handleSubmit}
        >
          Add
        </Button>
      </div>
    </div>
  );
});

interface SavedLocationImportListProps {
  existingLocationNames: string[];
  importingId: string | null;
  onImport: (savedLocationId: string) => void;
  savedLocations: SavedLocationImportItem[];
}

export const SavedLocationImportList = memo(function SavedLocationImportList({
  existingLocationNames,
  importingId,
  onImport,
  savedLocations,
}: SavedLocationImportListProps) {
  if (savedLocations.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
        <p className="text-sm font-semibold text-slate-950">No saved locations yet</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Create them from the Library first, then import them here.
        </p>
      </div>
    );
  }

  const existingNames = new Set(existingLocationNames.map((name) => name.toLowerCase()));

  return (
    <div className="space-y-2">
      {savedLocations.map((location) => {
        const alreadyAdded = existingNames.has(location.name.toLowerCase());
        return (
          <div
            key={location.id}
            className="flex items-center gap-3 rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.12)]"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-950">{location.name}</span>
                <Badge
                  variant="outline"
                  className="border-slate-200 bg-slate-50 text-[11px] text-slate-600"
                >
                  {location.category}
                </Badge>
                {location.allSpies ? (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-[11px] text-amber-800"
                  >
                    All Spies
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {location.allSpies
                  ? "No shared location roles required"
                  : location.roles.map((role) => role.name).join(", ")}
              </p>
            </div>
            {alreadyAdded ? (
              <span className="text-xs font-medium text-slate-500">Already added</span>
            ) : (
              <Button
                aria-label={`Import ${location.name}`}
                disabled={importingId === location.id}
                size="sm"
                variant="outline"
                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                onClick={() => onImport(location.id)}
              >
                {importingId === location.id ? "Importing…" : "Import"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
});
