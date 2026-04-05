"use client";

import { Plus } from "lucide-react";
import React, { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import { CategoryGroupSection, CustomLocationRow } from "./location-settings-parts";

import type { LocationDataReturn } from "./use-location-data";
import type { LocationItem } from "@/domains/location/schema";

interface CategoryGroup {
  category: string;
  locations: LocationItem[];
}

export const LocationSettingsBody = memo(function LocationSettingsBody({
  data,
  categories,
  filter,
}: {
  data: LocationDataReturn;
  categories: CategoryGroup[];
  filter: string;
}) {
  const { t } = useTranslation();

  if (data.isLoading) {
    return <p className="text-muted-foreground py-8 text-center">{t.common.loading}</p>;
  }

  return (
    <div className="space-y-4">
      {categories.map((cat, i) => (
        <React.Fragment key={cat.category}>
          {i > 0 && <Separator />}
          <CategoryGroupSection
            category={cat.category}
            locations={cat.locations}
            onToggle={data.toggleLocation}
            onSelectAll={data.selectAllCategory}
            onDeselectAll={data.deselectAllCategory}
          />
        </React.Fragment>
      ))}
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
