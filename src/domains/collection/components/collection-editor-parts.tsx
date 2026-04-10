"use client";

import { Plus, Trash2 } from "lucide-react";
import { memo, useCallback, useState } from "react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

import type { CollectionLocationItem } from "../schema";

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
    <div className="bg-surface-1 flex items-center gap-3 rounded-xl p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{location.name}</span>
          {location.allSpies && <Badge variant="destructive">All Spies</Badge>}
        </div>
        <p className="text-muted-foreground text-xs">
          {location.roles.map((role) => role.name).join(", ")}
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

interface AddLocationFormProps {
  onAdd: (name: string, roles: string[], allSpies: boolean) => Promise<void>;
}

export const AddLocationForm = memo(function AddLocationForm({ onAdd }: AddLocationFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [rolesText, setRolesText] = useState("");
  const [allSpies, setAllSpies] = useState(false);

  const handleToggleExpanded = useCallback(() => setExpanded((previous) => !previous), []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      return;
    }
    const roles = rolesText
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
    if (roles.length === 0) {
      return;
    }
    await onAdd(name.trim(), roles, allSpies);
    setName("");
    setRolesText("");
    setAllSpies(false);
  }, [allSpies, name, onAdd, rolesText]);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [],
  );
  const handleRolesChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setRolesText(event.target.value),
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
