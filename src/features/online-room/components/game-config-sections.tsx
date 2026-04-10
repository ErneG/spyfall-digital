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
      <p className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">{t.config.spies}</p>
      <div className="flex gap-2">
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
      <p className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">{t.config.locations}</p>
      <button
        onClick={onOpenLocations}
        className="flex min-h-[64px] w-full items-center justify-between rounded-[28px] border border-white/80 bg-white/78 px-5 text-sm text-slate-950 shadow-[0_18px_45px_rgba(148,163,184,0.12)] transition hover:bg-white"
      >
        <span>
          {selectedLocationCount} / {totalLocationCount} {t.config.locationsSelected}
        </span>
        <span className="font-medium text-slate-500">{t.config.edit} &rarr;</span>
      </button>
    </div>
  );
});
