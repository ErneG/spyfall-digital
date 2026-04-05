"use client";

import { MapPin } from "lucide-react";
import { memo, useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";

import { EditionChip } from "./edition-picker-parts";

interface EditionPickerProps {
  editions: Array<1 | 2>;
  onChange: (editions: Array<1 | 2>) => void;
}

export const EditionPicker = memo(function EditionPicker({
  editions,
  onChange,
}: EditionPickerProps) {
  const { t } = useTranslation();
  const has1 = editions.includes(1);
  const has2 = editions.includes(2);

  const toggle = useCallback(
    (edition: 1 | 2) => {
      const next = editions.includes(edition)
        ? editions.filter((entry) => entry !== edition)
        : [...editions, edition];
      // Must have at least one edition selected
      if (next.length > 0) {
        onChange(next);
      }
    },
    [editions, onChange],
  );

  const handleToggle1 = useCallback(() => toggle(1), [toggle]);
  const handleToggle2 = useCallback(() => toggle(2), [toggle]);

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground/60 text-[11px] font-semibold tracking-[0.08em] uppercase">
        <MapPin className="mr-1 inline h-3 w-3" /> {t.locationSettings.title}
      </p>
      <div className="flex gap-1.5">
        <EditionChip label={t.locationSettings.edition1} active={has1} onToggle={handleToggle1} />
        <EditionChip label={t.locationSettings.edition2} active={has2} onToggle={handleToggle2} />
      </div>
    </div>
  );
});
