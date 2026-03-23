"use client";

import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Switch } from "@/shared/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { MapPin, Search, X, Plus, Trash2, Check } from "lucide-react";
import { updateLocationSelections, createCustomLocation, updateCustomLocation, deleteCustomLocation } from "@/domains/location/actions";
import { fetchLocations } from "@/domains/location/hooks";
import type { LocationItem, CustomLocationItem } from "@/domains/location/schema";
import { useTranslation } from "@/shared/i18n/context";

interface LocationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  playerId: string;
}

/* ── Sub-components ───────────────────────────────────── */

const LocationButton = memo(function LocationButton({
  id, name, selected, onToggle,
}: {
  id: string; name: string; selected: boolean; onToggle: (id: string) => void;
}) {
  const { translateLocation } = useTranslation();
  const handleClick = useCallback(() => { onToggle(id); }, [onToggle, id]);
  return (
    <button
      onClick={handleClick}
      className={`rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
        selected ? "bg-primary/10 text-primary font-medium" : "bg-muted/30 text-muted-foreground line-through"
      }`}
    >
      {translateLocation(name)}
    </button>
  );
});

const LocationGroup = memo(function LocationGroup({
  title, locations, onToggle, onSelectAll, onDeselectAll,
}: {
  title: string; locations: LocationItem[]; onToggle: (id: string) => void; onSelectAll: () => void; onDeselectAll: () => void;
}) {
  const { t } = useTranslation();
  const selected = useMemo(() => locations.filter((l) => l.selected).length, [locations]);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {title} <span className="text-muted-foreground">({selected}/{locations.length})</span>
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-6 text-xs">{t.locationSettings.all}</Button>
          <Button variant="ghost" size="sm" onClick={onDeselectAll} className="h-6 text-xs">{t.locationSettings.none}</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {locations.map((loc) => (
          <LocationButton key={loc.id} id={loc.id} name={loc.name} selected={loc.selected} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
});

const CustomLocationRow = memo(function CustomLocationRow({
  location, onToggle, onDelete,
}: {
  location: CustomLocationItem; onToggle: (id: string, checked: boolean) => void; onDelete: (id: string) => void;
}) {
  const handleToggle = useCallback((checked: boolean) => { onToggle(location.id, checked); }, [onToggle, location.id]);
  const handleDelete = useCallback(() => { void onDelete(location.id); }, [onDelete, location.id]);
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
      <Switch checked={location.selected} onCheckedChange={handleToggle} />
      <span className="flex-1 text-sm">{location.name}</span>
      {location.allSpies && <Badge variant="destructive" className="text-xs">All Spies</Badge>}
      <button onClick={handleDelete}>
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
});

/* ── Data hook ────────────────────────────────────────── */

function useLocationData(roomCode: string, playerId: string, isOpen: boolean, onOpenChange: (open: boolean) => void) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [customLocations, setCustomLocations] = useState<CustomLocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLocations = useCallback(async () => {
    const data = await fetchLocations(roomCode);
    if (data) {
      setLocations(data.locations);
      setCustomLocations(data.customLocations);
    }
    setIsLoading(false);
  }, [roomCode]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate data fetch on dialog open
      void loadLocations();
    }
  }, [isOpen, loadLocations]);

  const toggleLocation = useCallback((locationId: string) => {
    setLocations((previous) =>
      previous.map((loc) => (loc.id === locationId ? { ...loc, selected: !loc.selected } : loc)),
    );
  }, []);

  const selectAll = useCallback((edition?: number) => {
    setLocations((previous) =>
      previous.map((loc) => (edition === undefined || loc.edition === edition ? { ...loc, selected: true } : loc)),
    );
  }, []);

  const deselectAll = useCallback((edition?: number) => {
    setLocations((previous) =>
      previous.map((loc) => (edition === undefined || loc.edition === edition ? { ...loc, selected: false } : loc)),
    );
  }, []);

  const selectAllEd1 = useCallback(() => { selectAll(1); }, [selectAll]);
  const deselectAllEd1 = useCallback(() => { deselectAll(1); }, [deselectAll]);
  const selectAllEd2 = useCallback(() => { selectAll(2); }, [selectAll]);
  const deselectAllEd2 = useCallback(() => { deselectAll(2); }, [deselectAll]);

  const saveSelections = useCallback(async () => {
    const selectedIds = locations.filter((l) => l.selected).map((l) => l.id);
    await updateLocationSelections({ code: roomCode, playerId, locationIds: selectedIds });
    for (const cl of customLocations) {
      await updateCustomLocation({ code: roomCode, playerId, locationId: cl.id, selected: cl.selected });
    }
    onOpenChange(false);
  }, [locations, customLocations, roomCode, playerId, onOpenChange]);

  const addCustomLocation = useCallback(async () => {
    const result = await createCustomLocation({ code: roomCode, playerId, name: "New Location", roles: ["Role 1", "Role 2", "Role 3"] });
    if (result.success) {
      setCustomLocations((previous) => [...previous, result.data]);
    }
  }, [roomCode, playerId]);

  const handleDeleteCustomLocation = useCallback(
    async (locationId: string) => {
      await deleteCustomLocation({ code: roomCode, playerId, locationId });
      setCustomLocations((previous) => previous.filter((cl) => cl.id !== locationId));
    },
    [roomCode, playerId],
  );

  const toggleCustomLocation = useCallback((id: string, checked: boolean) => {
    setCustomLocations((previous) =>
      previous.map((c) => (c.id === id ? { ...c, selected: checked } : c)),
    );
  }, []);

  const handleAddCustom = useCallback(() => { void addCustomLocation(); }, [addCustomLocation]);
  const handleSave = useCallback(() => { void saveSelections(); }, [saveSelections]);

  return {
    locations, customLocations, isLoading,
    toggleLocation, selectAllEd1, deselectAllEd1, selectAllEd2, deselectAllEd2,
    toggleCustomLocation, deleteCustomLocation: handleDeleteCustomLocation, handleAddCustom, handleSave,
  };
}

/* ── Main component ───────────────────────────────────── */

export const LocationSettings = memo(function LocationSettings({
  open, onOpenChange, roomCode, playerId,
}: LocationSettingsProps) {
  const { t } = useTranslation();
  const data = useLocationData(roomCode, playerId, open, onOpenChange);
  const [filter, setFilter] = useState("");

  const filteredLocations = useMemo(
    () => data.locations.filter((loc) => loc.name.toLowerCase().includes(filter.toLowerCase())),
    [data.locations, filter],
  );
  const edition1 = useMemo(() => filteredLocations.filter((l) => l.edition === 1), [filteredLocations]);
  const edition2 = useMemo(() => filteredLocations.filter((l) => l.edition === 2), [filteredLocations]);
  const selectedCount = useMemo(
    () => data.locations.filter((l) => l.selected).length + data.customLocations.filter((cl) => cl.selected).length,
    [data.locations, data.customLocations],
  );
  const clearFilter = useCallback(() => { setFilter(""); }, []);
  const handleClose = useCallback(() => { onOpenChange(false); }, [onOpenChange]);
  const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { setFilter(event.target.value); }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {t.locationSettings.title} ({selectedCount} {t.config.locationsSelected})
          </DialogTitle>
          <DialogDescription>{t.locationSettings.description}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t.locationSettings.filter} value={filter} onChange={handleFilterChange} className="pl-9" />
          {filter && (
            <button onClick={clearFilter} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {data.isLoading ? (
          <p className="py-8 text-center text-muted-foreground">{t.common.loading}</p>
        ) : (
          <div className="space-y-4">
            <LocationGroup title={t.locationSettings.edition1} locations={edition1} onToggle={data.toggleLocation} onSelectAll={data.selectAllEd1} onDeselectAll={data.deselectAllEd1} />
            <Separator />
            <LocationGroup title={t.locationSettings.edition2} locations={edition2} onToggle={data.toggleLocation} onSelectAll={data.selectAllEd2} onDeselectAll={data.deselectAllEd2} />
            {(data.customLocations.length > 0 || !filter) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{t.locationSettings.customLocations}</h3>
                    <Button variant="outline" size="sm" onClick={data.handleAddCustom} className="gap-1">
                      <Plus className="h-3 w-3" /> {t.locationSettings.add}
                    </Button>
                  </div>
                  {data.customLocations.map((cl) => (
                    <CustomLocationRow key={cl.id} location={cl} onToggle={data.toggleCustomLocation} onDelete={data.deleteCustomLocation} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose}>{t.common.cancel}</Button>
          <Button onClick={data.handleSave} className="gap-1"><Check className="h-4 w-4" /> {t.common.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
