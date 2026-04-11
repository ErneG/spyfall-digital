"use client";

import Link from "next/link";
import React, { memo } from "react";

import { LIBRARY_COLLECTIONS_ROUTE } from "@/features/library/routes";
import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import { CategoryGroupSection, CustomLocationRow } from "./location-settings-parts";

import type { LocationDataReturn } from "./use-location-data";
import type { LocationItem } from "@/entities/location/schema";

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
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">Imported room source</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Manage durable custom content in the Library, then import it here as a
                  collection-backed room source.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              >
                <Link href={LIBRARY_COLLECTIONS_ROUTE}>Open Library collections</Link>
              </Button>
            </div>
            {data.customLocations.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-950">
                  No imported room-source locations
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Import a Library collection when you want reusable custom roles in this room.
                </p>
              </div>
            ) : (
              data.customLocations.map((cl) => (
                <CustomLocationRow key={cl.id} location={cl} onToggle={data.toggleCustomLocation} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
});
