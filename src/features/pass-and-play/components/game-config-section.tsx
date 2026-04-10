"use client";

import { Clock, Eye, EyeOff } from "lucide-react";
import React from "react";

import { TIMER_PRESETS } from "@/shared/config/timer-presets";
import { useTranslation } from "@/shared/i18n/context";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

import { PnPPresetButton } from "./game-config-section-parts";

const SPY_OPTIONS = [1, 2] as const;

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
        <p className="text-[11px] tracking-[0.08em] text-slate-500 uppercase">
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
        <p className="text-[11px] tracking-[0.08em] text-slate-500 uppercase">{t.config.spies}</p>
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

      <div className="flex h-[56px] items-center justify-between rounded-[24px] border border-white/70 bg-white/72 px-4">
        <Label htmlFor="pnp-hide-spy" className="flex items-center gap-1.5 text-sm text-slate-700">
          {hideSpyCount ? (
            <EyeOff className="h-3.5 w-3.5 text-slate-500" />
          ) : (
            <Eye className="h-3.5 w-3.5 text-slate-500" />
          )}
          {t.config.hideSpyCount}
        </Label>
        <Switch id="pnp-hide-spy" checked={hideSpyCount} onCheckedChange={onHideSpyCountChange} />
      </div>
    </>
  );
});
