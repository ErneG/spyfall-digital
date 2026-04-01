"use client";

import { Plus } from "lucide-react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import { CustomLocationRow, LocationGroup } from "./location-settings-parts";

import type { LocationDataReturn } from "./use-location-data";
import type { LocationItem } from "@/domains/location/schema";


export const LocationSettingsBody = memo(function LocationSettingsBody({
  data,
  edition1,
  edition2,
  filter,
}: {
  data: LocationDataReturn;
  edition1: LocationItem[];
  edition2: LocationItem[];
  filter: string;
}) {
  const { t } = useTranslation();

  if (data.isLoading) {
    return <p className="text-muted-foreground py-8 text-center">{t.common.loading}</p>;
  }

  return (
    <div className="space-y-4">
      <LocationGroup
        title={t.locationSettings.edition1}
        locations={edition1}
        onToggle={data.toggleLocation}
        onSelectAll={data.selectAllEd1}
        onDeselectAll={data.deselectAllEd1}
      />
      <Separator />
      <LocationGroup
        title={t.locationSettings.edition2}
        locations={edition2}
        onToggle={data.toggleLocation}
        onSelectAll={data.selectAllEd2}
        onDeselectAll={data.deselectAllEd2}
      />
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
              <CustomLocationRow
                key={cl.id}
                location={cl}
                onToggle={data.toggleCustomLocation}
                onDelete={data.deleteCustomLocation}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});
