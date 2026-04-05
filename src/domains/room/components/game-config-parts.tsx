"use client";

import { Settings, Clock, Eye, EyeOff, Shield, Timer } from "lucide-react";
import { memo, useCallback } from "react";

import { TIMER_PRESETS } from "@/domains/room/schema";
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
    <div className="bg-surface-1 rounded-2xl p-4">
      <p className="text-muted-foreground/60 mb-3 text-[11px] tracking-[0.08em] uppercase">
        <Settings className="mr-1 inline h-3 w-3" /> {t.config.gameSettings}
      </p>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-muted-foreground rounded-lg bg-white/8 px-2.5 py-1 text-[13px]">
          <Clock className="mr-1 inline h-3 w-3" />
          {Math.floor(timeLimit / SECONDS_PER_MINUTE)}:
          {String(timeLimit % SECONDS_PER_MINUTE).padStart(2, "0")}
        </span>
        <span className="text-muted-foreground rounded-lg bg-white/8 px-2.5 py-1 text-[13px]">
          {spyCount} {spyCount === 1 ? t.config.spy : t.config.spiesPlural}
        </span>
        <span className="text-muted-foreground rounded-lg bg-white/8 px-2.5 py-1 text-[13px]">
          {selectedLocationCount}/{totalLocationCount} {t.config.locationsSelected}
        </span>
        {moderatorMode && (
          <span className="bg-spy-purple/12 text-spy-purple rounded-lg px-2.5 py-1 text-[13px]">
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
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
        isSelected ? "bg-white text-black" : "bg-surface-2 text-muted-foreground hover:bg-surface-3"
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
    <div className="bg-surface-1 overflow-hidden rounded-2xl">
      <div className="flex h-[56px] items-center justify-between px-4">
        <Label htmlFor="auto-start" className="flex items-center gap-2 text-sm">
          <Timer className="text-muted-foreground h-3.5 w-3.5" /> {t.config.autoStartTimer}
        </Label>
        <Switch id="auto-start" checked={autoStartTimer} onCheckedChange={onAutoStart} />
      </div>
      <div className="mx-4 h-px bg-white/5" />
      <div className="flex h-[56px] items-center justify-between px-4">
        <Label htmlFor="hide-spy" className="flex items-center gap-2 text-sm">
          {hideSpyCount ? (
            <EyeOff className="text-muted-foreground h-3.5 w-3.5" />
          ) : (
            <Eye className="text-muted-foreground h-3.5 w-3.5" />
          )}
          {t.config.hideSpyCount}
        </Label>
        <Switch id="hide-spy" checked={hideSpyCount} onCheckedChange={onHideSpy} />
      </div>
      <div className="mx-4 h-px bg-white/5" />
      <div className="flex h-[56px] items-center justify-between px-4">
        <Label htmlFor="moderator" className="flex items-center gap-2 text-sm">
          <Shield className="text-muted-foreground h-3.5 w-3.5" /> {t.config.moderatorMode}
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
      <p className="text-muted-foreground/60 text-[11px] tracking-[0.08em] uppercase">
        <Clock className="mr-1 inline h-3 w-3" /> {t.config.timer}
      </p>
      <div className="flex gap-1.5">
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
