"use client";

import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Search, X, Plus, Trash2, Check } from "lucide-react";

interface LocationItem {
  id: string;
  name: string;
  edition?: number;
  selected: boolean;
}

interface CustomLocationItem {
  id: string;
  name: string;
  allSpies: boolean;
  selected: boolean;
  roles: { id: string; name: string }[];
}

interface LocationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  playerId: string;
}

const LocationButton = memo(function LocationButton({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
        selected
          ? "bg-primary/10 text-primary font-medium"
          : "bg-muted/30 text-muted-foreground line-through"
      }`}
    >
      {name}
    </button>
  );
});

const LocationGroup = memo(function LocationGroup({
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
  const selected = useMemo(() => locations.filter((l) => l.selected).length, [locations]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {title}{" "}
          <span className="text-muted-foreground">
            ({selected}/{locations.length})
          </span>
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-6 text-xs">
            All
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeselectAll} className="h-6 text-xs">
            None
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {locations.map((loc) => (
          <LocationButton
            key={loc.id}
            name={loc.name}
            selected={loc.selected}
            onClick={() => onToggle(loc.id)}
          />
        ))}
      </div>
    </div>
  );
});

export const LocationSettings = memo(function LocationSettings({
  open,
  onOpenChange,
  roomCode,
  playerId,
}: LocationSettingsProps) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [customLocations, setCustomLocations] = useState<CustomLocationItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    const res = await fetch(`/api/rooms/${roomCode}/locations`);
    if (res.ok) {
      const data = await res.json();
      setLocations(data.locations);
      setCustomLocations(data.customLocations);
    }
    setLoading(false);
  }, [roomCode]);

  useEffect(() => {
    if (open) void fetchLocations();
  }, [open, fetchLocations]);

  const toggleLocation = useCallback((locationId: string) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === locationId ? { ...loc, selected: !loc.selected } : loc)),
    );
  }, []);

  const selectAll = useCallback((edition?: number) => {
    setLocations((prev) =>
      prev.map((loc) =>
        edition === undefined || loc.edition === edition ? { ...loc, selected: true } : loc,
      ),
    );
  }, []);

  const deselectAll = useCallback((edition?: number) => {
    setLocations((prev) =>
      prev.map((loc) =>
        edition === undefined || loc.edition === edition ? { ...loc, selected: false } : loc,
      ),
    );
  }, []);

  const selectAllEd1 = useCallback(() => selectAll(1), [selectAll]);
  const deselectAllEd1 = useCallback(() => deselectAll(1), [deselectAll]);
  const selectAllEd2 = useCallback(() => selectAll(2), [selectAll]);
  const deselectAllEd2 = useCallback(() => deselectAll(2), [deselectAll]);

  const saveSelections = useCallback(async () => {
    const selectedIds = locations.filter((l) => l.selected).map((l) => l.id);
    await fetch(`/api/rooms/${roomCode}/locations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, locationIds: selectedIds }),
    });

    for (const cl of customLocations) {
      await fetch(`/api/rooms/${roomCode}/custom-locations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, locationId: cl.id, selected: cl.selected }),
      });
    }
    onOpenChange(false);
  }, [locations, customLocations, roomCode, playerId, onOpenChange]);

  const addCustomLocation = useCallback(async () => {
    const res = await fetch(`/api/rooms/${roomCode}/custom-locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, name: "New Location", roles: ["Role 1", "Role 2", "Role 3"] }),
    });
    if (res.ok) {
      const data = await res.json();
      setCustomLocations((prev) => [...prev, data]);
    }
  }, [roomCode, playerId]);

  const deleteCustomLocation = useCallback(
    async (locationId: string) => {
      await fetch(`/api/rooms/${roomCode}/custom-locations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, locationId }),
      });
      setCustomLocations((prev) => prev.filter((cl) => cl.id !== locationId));
    },
    [roomCode, playerId],
  );

  const toggleCustomLocation = useCallback((id: string, checked: boolean) => {
    setCustomLocations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: checked } : c)),
    );
  }, []);

  const filteredLocations = useMemo(
    () => locations.filter((loc) => loc.name.toLowerCase().includes(filter.toLowerCase())),
    [locations, filter],
  );

  const edition1 = useMemo(() => filteredLocations.filter((l) => l.edition === 1), [filteredLocations]);
  const edition2 = useMemo(() => filteredLocations.filter((l) => l.edition === 2), [filteredLocations]);
  const selectedCount = useMemo(
    () => locations.filter((l) => l.selected).length + customLocations.filter((cl) => cl.selected).length,
    [locations, customLocations],
  );

  const clearFilter = useCallback(() => setFilter(""), []);
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Locations ({selectedCount} selected)
          </DialogTitle>
          <DialogDescription>Choose which locations to include in the game.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter locations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
          {filter && (
            <button onClick={clearFilter} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-4">
            <LocationGroup
              title="Spyfall 1"
              locations={edition1}
              onToggle={toggleLocation}
              onSelectAll={selectAllEd1}
              onDeselectAll={deselectAllEd1}
            />
            <Separator />
            <LocationGroup
              title="Spyfall 2"
              locations={edition2}
              onToggle={toggleLocation}
              onSelectAll={selectAllEd2}
              onDeselectAll={deselectAllEd2}
            />

            {(customLocations.length > 0 || !filter) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Custom Locations</h3>
                    <Button variant="outline" size="sm" onClick={() => void addCustomLocation()} className="gap-1">
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                  {customLocations.map((cl) => (
                    <div key={cl.id} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                      <Switch
                        checked={cl.selected}
                        onCheckedChange={(checked) => toggleCustomLocation(cl.id, checked)}
                      />
                      <span className="flex-1 text-sm">{cl.name}</span>
                      {cl.allSpies && (
                        <Badge variant="destructive" className="text-xs">All Spies</Badge>
                      )}
                      <button onClick={() => void deleteCustomLocation(cl.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button onClick={() => void saveSelections()} className="gap-1">
            <Check className="h-4 w-4" /> Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
