"use client";

import { Search, X, Trash2 } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";

import type { CustomLocationItem, LocationItem } from "@/domains/location/schema";

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
      className={`rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
        selected
          ? "bg-primary/10 text-primary font-medium"
          : "bg-muted/30 text-muted-foreground line-through"
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
        <h3 className="text-sm font-medium">
          {title}{" "}
          <span className="text-muted-foreground">
            ({selected}/{locations.length})
          </span>
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-6 text-xs">
            {t.locationSettings.all}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeselectAll} className="h-6 text-xs">
            {t.locationSettings.none}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
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
  onDelete,
}: {
  location: CustomLocationItem;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const handleToggle = useCallback(
    (checked: boolean) => {
      onToggle(location.id, checked);
    },
    [onToggle, location.id],
  );
  const handleDelete = useCallback(() => {
    void onDelete(location.id);
  }, [onDelete, location.id]);
  return (
    <div className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2">
      <Switch checked={location.selected} onCheckedChange={handleToggle} />
      <span className="flex-1 text-sm">{location.name}</span>
      {location.allSpies && (
        <Badge variant="destructive" className="text-xs">
          All Spies
        </Badge>
      )}
      <button onClick={handleDelete}>
        <Trash2 className="text-muted-foreground hover:text-destructive h-3.5 w-3.5" />
      </button>
    </div>
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
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder={t.locationSettings.filter}
        value={filter}
        onChange={onFilterChange}
        className="pl-9"
      />
      {filter && (
        <button onClick={onClear} className="absolute top-1/2 right-3 -translate-y-1/2">
          <X className="text-muted-foreground h-4 w-4" />
        </button>
      )}
    </div>
  );
});
