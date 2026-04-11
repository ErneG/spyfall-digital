"use client";

import { Settings, Clock, Eye, EyeOff, Shield, Timer } from "lucide-react";
import { memo, useCallback } from "react";

import { TIMER_PRESETS } from "@/shared/config/timer-presets";
import { useTranslation } from "@/shared/i18n/context";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

const SECONDS_PER_MINUTE = 60;

interface GameConfigSummaryProps {
  timeLimit: number;
  spyCount: number;
  selectedLocationCount: number;
  totalLocationCount: number;
  moderatorMode: boolean;
}

export const GameConfigSummary = memo(function GameConfigSummary({
  timeLimit,
  spyCount,
  selectedLocationCount,
  totalLocationCount,
  moderatorMode,
}: GameConfigSummaryProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
      <p className="mb-4 text-[11px] tracking-[0.16em] text-slate-500 uppercase">
        <Settings className="mr-1 inline h-3 w-3" /> {t.config.gameSettings}
      </p>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] text-slate-600">
          <Clock className="mr-1 inline h-3 w-3" />
          {Math.floor(timeLimit / SECONDS_PER_MINUTE)}:
          {String(timeLimit % SECONDS_PER_MINUTE).padStart(2, "0")}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] text-slate-600">
          {spyCount} {spyCount === 1 ? t.config.spy : t.config.spiesPlural}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] text-slate-600">
          {selectedLocationCount}/{totalLocationCount} {t.config.locationsSelected}
        </span>
        {moderatorMode && (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[13px] text-sky-700">
            <Shield className="mr-1 inline h-3 w-3" /> {t.config.moderatorMode}
          </span>
        )}
      </div>
    </div>
  );
});
export const PresetButton = memo(function PresetButton({
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
  const handleClick = useCallback(() => {
    onClick(value);
  }, [onClick, value]);
  return (
    <button
      onClick={handleClick}
      className={`flex-1 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
        isSelected
          ? "border-slate-950/5 bg-slate-950 text-white shadow-[0_16px_32px_rgba(15,23,42,0.12)]"
          : "border-white/80 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {label}
    </button>
  );
});
export const ConfigToggles = memo(function ConfigToggles({
  autoStartTimer,
  hideSpyCount,
  moderatorMode,
  onAutoStart,
  onHideSpy,
  onModerator,
}: {
  autoStartTimer: boolean;
  hideSpyCount: boolean;
  moderatorMode: boolean;
  onAutoStart: (checked: boolean) => void;
  onHideSpy: (checked: boolean) => void;
  onModerator: (checked: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/78 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
      <div className="flex min-h-[64px] items-center justify-between px-5">
        <Label htmlFor="auto-start" className="flex items-center gap-2 text-sm text-slate-950">
          <Timer className="h-3.5 w-3.5 text-slate-400" /> {t.config.autoStartTimer}
        </Label>
        <Switch id="auto-start" checked={autoStartTimer} onCheckedChange={onAutoStart} />
      </div>
      <div className="mx-5 h-px bg-slate-200/80" />
      <div className="flex min-h-[64px] items-center justify-between px-5">
        <Label htmlFor="hide-spy" className="flex items-center gap-2 text-sm text-slate-950">
          {hideSpyCount ? (
            <EyeOff className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <Eye className="h-3.5 w-3.5 text-slate-400" />
          )}
          {t.config.hideSpyCount}
        </Label>
        <Switch id="hide-spy" checked={hideSpyCount} onCheckedChange={onHideSpy} />
      </div>
      <div className="mx-5 h-px bg-slate-200/80" />
      <div className="flex min-h-[64px] items-center justify-between px-5">
        <Label htmlFor="moderator" className="flex items-center gap-2 text-sm text-slate-950">
          <Shield className="h-3.5 w-3.5 text-slate-400" /> {t.config.moderatorMode}
        </Label>
        <Switch id="moderator" checked={moderatorMode} onCheckedChange={onModerator} />
      </div>
    </div>
  );
});
export const TimerSection = memo(function TimerSection({
  timeLimit,
  onSelect,
}: {
  timeLimit: number;
  onSelect: (value: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <p className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">
        <Clock className="mr-1 inline h-3 w-3" /> {t.config.timer}
      </p>
      <div className="flex gap-2">
        {TIMER_PRESETS.map((preset) => (
          <PresetButton
            key={preset.value}
            label={preset.label}
            value={preset.value}
            isSelected={timeLimit === preset.value}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
});
