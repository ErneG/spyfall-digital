"use client";

import { Plus } from "lucide-react";
import React, { memo, useCallback, useMemo, useState } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import {
  CategoryGroupSection,
  CustomLocationEditorCard,
  CustomLocationRow,
} from "./location-settings-parts";

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
  const [editorState, setEditorState] = useState<
    { mode: "create" } | { mode: "edit"; locationId: string } | null
  >(null);

  const editingLocation = useMemo(() => {
    if (editorState?.mode !== "edit") {
      return null;
    }
    return data.customLocations.find((location) => location.id === editorState.locationId) ?? null;
  }, [data.customLocations, editorState]);

  const handleStartCreate = useCallback(() => {
    setEditorState({ mode: "create" });
  }, []);

  const handleStartEdit = useCallback((locationId: string) => {
    setEditorState({ mode: "edit", locationId });
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorState(null);
  }, []);

  const handleSaveCustomLocation = useCallback(
    async (input: { id?: string; name: string; roles: string[]; allSpies: boolean }) => {
      const didSave = await data.saveCustomLocation(input);
      if (didSave) {
        setEditorState(null);
      }
    },
    [data],
  );

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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  {t.locationSettings.customLocations}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Build room-only locations with explicit role lists instead of placeholder entries.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartCreate}
                className="gap-1 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              >
                <Plus className="h-3 w-3" /> {t.locationSettings.add}
              </Button>
            </div>
            {editorState ? (
              <CustomLocationEditorCard
                key={editorState.mode === "edit" ? editorState.locationId : "create"}
                mode={editorState.mode}
                initialLocation={editingLocation}
                onCancel={handleCloseEditor}
                onSave={handleSaveCustomLocation}
              />
            ) : null}
            {data.customLocations.map((cl) => (
              <CustomLocationRow
                key={cl.id}
                location={cl}
                onToggle={data.toggleCustomLocation}
                onEdit={handleStartEdit}
                onDelete={data.deleteCustomLocation}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});
