"use client";

import { Search, X } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";

import type { CustomLocationItem, LocationItem } from "@/entities/location/schema";

export const LocationButton = memo(function LocationButton({
  id,
  name,
  selected,
  onToggle,
}: {
  id: string;
  name: string;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const { translateLocation } = useTranslation();
  const handleClick = useCallback(() => {
    onToggle(id);
  }, [onToggle, id]);
  return (
    <button
      onClick={handleClick}
      className={`rounded-2xl border px-3 py-2 text-left text-xs transition ${
        selected
          ? "border-sky-200 bg-sky-50 text-sky-900 shadow-[0_12px_24px_rgba(186,230,253,0.2)]"
          : "border-slate-200 bg-slate-100/80 text-slate-500"
      }`}
    >
      {translateLocation(name)}
    </button>
  );
});

export const LocationGroup = memo(function LocationGroup({
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
  const { t } = useTranslation();
  const selected = useMemo(() => locations.filter((l) => l.selected).length, [locations]);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-950">
          {title}{" "}
          <span className="text-slate-500">
            ({selected}/{locations.length})
          </span>
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="h-8 rounded-full px-3 text-xs text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
          >
            {t.locationSettings.all}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="h-8 rounded-full px-3 text-xs text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
          >
            {t.locationSettings.none}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {locations.map((loc) => (
          <LocationButton
            key={loc.id}
            id={loc.id}
            name={loc.name}
            selected={loc.selected}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
});

export const CustomLocationRow = memo(function CustomLocationRow({
  location,
  onToggle,
}: {
  location: CustomLocationItem;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const handleToggle = useCallback(
    (checked: boolean) => {
      onToggle(location.id, checked);
    },
    [onToggle, location.id],
  );

  const roleSummary = location.allSpies
    ? "No shared location roles required"
    : location.roles.map((role) => role.name).join(", ");

  return (
    <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
      <div className="flex flex-wrap items-start gap-3">
        <div className="pt-1">
          <Switch checked={location.selected} onCheckedChange={handleToggle} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">{location.name}</p>
            {location.allSpies ? (
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-[11px] text-amber-800"
              >
                All Spies
              </Badge>
            ) : null}
            {location.selected ? (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700"
              >
                Included
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-100 text-[11px] text-slate-500"
              >
                Excluded
              </Badge>
            )}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">{roleSummary}</p>
        </div>
      </div>
    </div>
  );
});

export const CategoryGroupSection = memo(function CategoryGroupSection({
  category,
  locations,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  category: string;
  locations: LocationItem[];
  onToggle: (id: string) => void;
  onSelectAll: (category: string) => void;
  onDeselectAll: (category: string) => void;
}) {
  const handleSelectAll = useCallback(() => {
    onSelectAll(category);
  }, [onSelectAll, category]);
  const handleDeselectAll = useCallback(() => {
    onDeselectAll(category);
  }, [onDeselectAll, category]);

  const { translateCategory } = useTranslation();

  return (
    <LocationGroup
      title={translateCategory(category)}
      locations={locations}
      onToggle={onToggle}
      onSelectAll={handleSelectAll}
      onDeselectAll={handleDeselectAll}
    />
  );
});

export const LocationFilterInput = memo(function LocationFilterInput({
  filter,
  onFilterChange,
  onClear,
}: {
  filter: string;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        aria-label={t.locationSettings.filter}
        placeholder={t.locationSettings.filter}
        value={filter}
        onChange={onFilterChange}
        className="rounded-2xl border-white/70 bg-white/80 pl-9 text-slate-950 placeholder:text-slate-400"
      />
      {filter && (
        <button
          type="button"
          aria-label="Clear filter"
          onClick={onClear}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
