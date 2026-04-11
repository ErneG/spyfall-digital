"use client";

import { BookMarked, Layers3 } from "lucide-react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

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

export const SourceSection = memo(function SourceSection({
  canImportCollections,
  selectedLocationCount,
  totalLocationCount,
  onOpenBuiltIn,
  onOpenCollection,
}: {
  canImportCollections: boolean;
  selectedLocationCount: number;
  totalLocationCount: number;
  onOpenBuiltIn: () => void;
  onOpenCollection: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <p className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">{t.config.source}</p>

      <div className="rounded-[28px] border border-white/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Layers3 className="size-4" />
              {t.config.builtInCatalog}
            </div>
            <p className="text-xs leading-5 text-slate-500">
              {selectedLocationCount} / {totalLocationCount} {t.config.locationsSelected}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            onClick={onOpenBuiltIn}
          >
            {t.config.advancedRoomCustomization}
          </Button>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <BookMarked className="size-4" />
              {t.config.collection}
            </div>
            <p className="text-xs leading-5 text-slate-500">
              {canImportCollections ? t.config.collectionImportHint : t.config.signInForCollections}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
            onClick={onOpenCollection}
            disabled={!canImportCollections}
          >
            {t.config.importCollection}
          </Button>
        </div>
      </div>
    </div>
  );
});
