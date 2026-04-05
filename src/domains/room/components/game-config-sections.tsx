"use client";

import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";

import { PresetButton } from "./game-config-parts";

const SPY_OPTIONS = [1, 2] as const;

export const SpySection = memo(function SpySection({
  spyCount,
  onSelect,
}: {
  spyCount: number;
  onSelect: (count: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground/60 text-[11px] tracking-[0.08em] uppercase">
        {t.config.spies}
      </p>
      <div className="flex gap-1.5">
        {SPY_OPTIONS.map((count) => (
          <PresetButton
            key={count}
            label={`${count} ${count === 1 ? t.config.spy : t.config.spiesPlural}`}
            value={count}
            isSelected={spyCount === count}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
});

export const LocationSection = memo(function LocationSection({
  selectedLocationCount,
  totalLocationCount,
  onOpenLocations,
}: {
  selectedLocationCount: number;
  totalLocationCount: number;
  onOpenLocations: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground/60 text-[11px] tracking-[0.08em] uppercase">
        {t.config.locations}
      </p>
      <button
        onClick={onOpenLocations}
        className="bg-surface-1 hover:bg-surface-2 flex h-[56px] w-full items-center justify-between rounded-2xl px-4 text-sm transition-colors"
      >
        <span>
          {selectedLocationCount} / {totalLocationCount} {t.config.locationsSelected}
        </span>
        <span className="text-muted-foreground/60">{t.config.edit} &rarr;</span>
      </button>
    </div>
  );
});
