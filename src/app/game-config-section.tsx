"use client";

import { Eye, EyeOff, Clock } from "lucide-react";
import React, { useCallback } from "react";

import { TIMER_PRESETS } from "@/domains/room/schema";
import { useTranslation } from "@/shared/i18n/context";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

const SPY_OPTIONS = [1, 2] as const;

/* ── Preset button ───────────────────────────────────── */

const PnPPresetButton = React.memo(function PnPPresetButton({
  label,
  value,
  isSelected,
  onClick,
}: {
  label: string;
  value: number;
  isSelected: boolean;
  onClick: (value: number) => void;
}) {
  const handleClick = useCallback(() => onClick(value), [onClick, value]);
  return (
    <button
      onClick={handleClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
        isSelected ? "bg-white text-black" : "bg-[#141414] text-[#8E8E93] hover:bg-[#1C1C1E]"
      }`}
    >
      {label}
    </button>
  );
});

/* ── Config section ──────────────────────────────────── */

export interface GameConfigSectionProps {
  timeLimit: number;
  spyCount: number;
  hideSpyCount: boolean;
  onTimeLimitChange: (value: number) => void;
  onSpyCountChange: (value: number) => void;
  onHideSpyCountChange: (checked: boolean) => void;
}

export const GameConfigSection = React.memo(function GameConfigSection({
  timeLimit,
  spyCount,
  hideSpyCount,
  onTimeLimitChange,
  onSpyCountChange,
  onHideSpyCountChange,
}: GameConfigSectionProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
          <Clock className="mr-1 inline h-3 w-3" /> {t.config.timer}
        </p>
        <div className="flex gap-1.5">
          {TIMER_PRESETS.map((preset) => (
            <PnPPresetButton
              key={preset.value}
              label={preset.label}
              value={preset.value}
              isSelected={timeLimit === preset.value}
              onClick={onTimeLimitChange}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.08em] text-[#48484A] uppercase">{t.config.spies}</p>
        <div className="flex gap-1.5">
          {SPY_OPTIONS.map((count) => (
            <PnPPresetButton
              key={count}
              label={`${count} ${count === 1 ? t.config.spy : t.config.spiesPlural}`}
              value={count}
              isSelected={spyCount === count}
              onClick={onSpyCountChange}
            />
          ))}
        </div>
      </div>

      <div className="flex h-[56px] items-center justify-between rounded-2xl bg-[#141414] px-4">
        <Label htmlFor="pnp-hide-spy" className="flex items-center gap-1.5 text-sm">
          {hideSpyCount ? (
            <EyeOff className="h-3.5 w-3.5 text-[#8E8E93]" />
          ) : (
            <Eye className="h-3.5 w-3.5 text-[#8E8E93]" />
          )}
          {t.config.hideSpyCount}
        </Label>
        <Switch id="pnp-hide-spy" checked={hideSpyCount} onCheckedChange={onHideSpyCountChange} />
      </div>
    </>
  );
});
