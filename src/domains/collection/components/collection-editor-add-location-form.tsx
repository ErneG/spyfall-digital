"use client";

import { Plus } from "lucide-react";
import { memo, useCallback, useState, type ChangeEvent } from "react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

interface AddLocationFormProps {
  onAdd: (name: string, roles: string[], allSpies: boolean) => void;
}

export const CollectionEditorAddLocationForm = memo(function CollectionEditorAddLocationForm({
  onAdd,
}: AddLocationFormProps) {
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
    (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [],
  );
  const handleRolesChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setRolesText(event.target.value),
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
