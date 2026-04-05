"use client";

import { MapPin } from "lucide-react";
import { memo, useCallback } from "react";

import { LOCATION_CATEGORIES } from "@/domains/location/data";
import { useTranslation } from "@/shared/i18n/context";

import { CategoryChip } from "./category-picker-parts";

interface CategoryPickerProps {
  categories: string[];
  onChange: (categories: string[]) => void;
}

export const CategoryPicker = memo(function CategoryPicker({
  categories,
  onChange,
}: CategoryPickerProps) {
  const { t } = useTranslation();

  const toggle = useCallback(
    (category: string) => {
      const next = categories.includes(category)
        ? categories.filter((c) => c !== category)
        : [...categories, category];
      // Must have at least one category selected
      if (next.length > 0) {
        onChange(next);
      }
    },
    [categories, onChange],
  );

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground/60 text-[11px] font-semibold tracking-[0.08em] uppercase">
        <MapPin className="mr-1 inline h-3 w-3" /> {t.locationSettings.title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {LOCATION_CATEGORIES.map((cat) => (
          <CategoryChip key={cat} label={cat} active={categories.includes(cat)} onToggle={toggle} />
        ))}
      </div>
    </div>
  );
});
