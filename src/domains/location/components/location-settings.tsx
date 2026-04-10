"use client";

import { MapPin, Check, BookOpen } from "lucide-react";
import { memo, useState, useCallback, useMemo } from "react";

import { useAuth } from "@/domains/auth/hooks";
import { CollectionPicker } from "@/domains/collection/components/collection-picker";
import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { LocationSettingsBody } from "./location-settings-body";
import { LocationFilterInput } from "./location-settings-parts";
import { useLocationData } from "./use-location-data";

import type { LocationItem } from "@/domains/location/schema";

function useLocationFilter(locations: LocationItem[]) {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(
    () => locations.filter((loc) => loc.name.toLowerCase().includes(filter.toLowerCase())),
    [locations, filter],
  );
  const categories = useMemo(() => {
    const grouped = new Map<string, LocationItem[]>();
    for (const loc of filtered) {
      const cat = loc.category;
      const list = grouped.get(cat);
      if (list) {
        list.push(loc);
      } else {
        grouped.set(cat, [loc]);
      }
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, locs]) => ({ category, locations: locs }));
  }, [filtered]);
  const clearFilter = useCallback(() => {
    setFilter("");
  }, []);
  const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  }, []);
  return { filter, categories, clearFilter, handleFilterChange };
}

interface LocationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  playerId: string;
}

export const LocationSettings = memo(function LocationSettings({
  open,
  onOpenChange,
  roomCode,
  playerId,
}: LocationSettingsProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const data = useLocationData(roomCode, playerId, open, onOpenChange);
  const { filter, categories, clearFilter, handleFilterChange } = useLocationFilter(data.locations);
  const selectedCount = useMemo(
    () =>
      data.locations.filter((l) => l.selected).length +
      data.customLocations.filter((cl) => cl.selected).length,
    [data.locations, data.customLocations],
  );
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);
  const handleOpenPicker = useCallback(() => setPickerOpen(true), []);
  const handleImported = useCallback(() => {
    // Refetch location data after import
    void data.refetch();
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-white/80 bg-white/82 shadow-[0_32px_90px_rgba(148,163,184,0.22)] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-950">
            <MapPin className="h-4 w-4" /> {t.locationSettings.title} ({selectedCount}{" "}
            {t.config.locationsSelected})
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {t.locationSettings.description}
          </DialogDescription>
        </DialogHeader>
        <LocationFilterInput
          filter={filter}
          onFilterChange={handleFilterChange}
          onClear={clearFilter}
        />
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            onClick={handleOpenPicker}
          >
            <BookOpen className="size-3.5" />
            Import from Collection
          </Button>
        )}
        <LocationSettingsBody data={data} categories={categories} filter={filter} />
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="rounded-full text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={data.handleSave}
            className="gap-1 rounded-full border border-slate-950/5 bg-slate-950 text-white hover:bg-slate-900"
          >
            <Check className="h-4 w-4" /> {t.common.save}
          </Button>
        </div>
      </DialogContent>
      {isAuthenticated && (
        <CollectionPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          roomCode={roomCode}
          playerId={playerId}
          onImported={handleImported}
        />
      )}
    </Dialog>
  );
});
