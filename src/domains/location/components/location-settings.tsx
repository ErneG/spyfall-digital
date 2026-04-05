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
  const edition1 = useMemo(() => filtered.filter((l) => l.edition === 1), [filtered]);
  const edition2 = useMemo(() => filtered.filter((l) => l.edition === 2), [filtered]);
  const clearFilter = useCallback(() => {
    setFilter("");
  }, []);
  const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  }, []);
  return { filter, edition1, edition2, clearFilter, handleFilterChange };
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
  const { filter, edition1, edition2, clearFilter, handleFilterChange } = useLocationFilter(
    data.locations,
  );
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
    data.refetch();
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {t.locationSettings.title} ({selectedCount}{" "}
            {t.config.locationsSelected})
          </DialogTitle>
          <DialogDescription>{t.locationSettings.description}</DialogDescription>
        </DialogHeader>
        <LocationFilterInput
          filter={filter}
          onFilterChange={handleFilterChange}
          onClear={clearFilter}
        />
        {isAuthenticated && (
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleOpenPicker}>
            <BookOpen className="size-3.5" />
            Import from Collection
          </Button>
        )}
        <LocationSettingsBody data={data} edition1={edition1} edition2={edition2} filter={filter} />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            {t.common.cancel}
          </Button>
          <Button onClick={data.handleSave} className="gap-1">
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
