"use client";

import { MapPin, Check } from "lucide-react";
import { memo, useState, useCallback, useMemo } from "react";

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
    </Dialog>
  );
});
