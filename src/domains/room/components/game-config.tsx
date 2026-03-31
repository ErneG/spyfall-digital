"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Clock, Eye, EyeOff, Shield, Timer } from "lucide-react";
import { memo, useCallback } from "react";

import { updateRoomConfig } from "@/domains/room/actions";
import { roomKeys } from "@/domains/room/hooks";
import { TIMER_PRESETS, type RoomEvent } from "@/domains/room/schema";
import { useTranslation } from "@/shared/i18n/context";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

const SECONDS_PER_MINUTE = 60;
const SPY_OPTIONS = [1, 2] as const;

interface GameConfigProps {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  timeLimit: number;
  spyCount: number;
  autoStartTimer: boolean;
  hideSpyCount: boolean;
  moderatorMode: boolean;
  selectedLocationCount: number;
  totalLocationCount: number;
  onOpenLocations: () => void;
}

interface ConfigPatch {
  timeLimit?: number;
  spyCount?: number;
  autoStartTimer?: boolean;
  hideSpyCount?: boolean;
  moderatorMode?: boolean;
}

/* -- Sub-components ----------------------------------------- */

const GameConfigSummary = memo(function GameConfigSummary({
  timeLimit,
  spyCount,
  selectedLocationCount,
  totalLocationCount,
  moderatorMode,
}: Pick<
  GameConfigProps,
  "timeLimit" | "spyCount" | "selectedLocationCount" | "totalLocationCount" | "moderatorMode"
>) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-[#141414] p-4">
      <p className="mb-3 text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
        <Settings className="mr-1 inline h-3 w-3" /> {t.config.gameSettings}
      </p>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-lg bg-white/8 px-2.5 py-1 text-[13px] text-[#8E8E93]">
          <Clock className="mr-1 inline h-3 w-3" />
          {Math.floor(timeLimit / SECONDS_PER_MINUTE)}:
          {String(timeLimit % SECONDS_PER_MINUTE).padStart(2, "0")}
        </span>
        <span className="rounded-lg bg-white/8 px-2.5 py-1 text-[13px] text-[#8E8E93]">
          {spyCount} {spyCount === 1 ? t.config.spy : t.config.spiesPlural}
        </span>
        <span className="rounded-lg bg-white/8 px-2.5 py-1 text-[13px] text-[#8E8E93]">
          {selectedLocationCount}/{totalLocationCount} {t.config.locationsSelected}
        </span>
        {moderatorMode && (
          <span className="rounded-lg bg-[#8B5CF6]/12 px-2.5 py-1 text-[13px] text-[#8B5CF6]">
            <Shield className="mr-1 inline h-3 w-3" /> {t.config.moderatorMode}
          </span>
        )}
      </div>
    </div>
  );
});

const PresetButton = memo(function PresetButton({
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
        isSelected ? "bg-white text-black" : "bg-[#1C1C1E] text-[#8E8E93] hover:bg-[#2C2C2E]"
      }`}
    >
      {label}
    </button>
  );
});

const ConfigToggles = memo(function ConfigToggles({
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
    <div className="overflow-hidden rounded-2xl bg-[#141414]">
      <div className="flex h-[56px] items-center justify-between px-4">
        <Label htmlFor="auto-start" className="flex items-center gap-2 text-sm">
          <Timer className="h-3.5 w-3.5 text-[#8E8E93]" /> {t.config.autoStartTimer}
        </Label>
        <Switch id="auto-start" checked={autoStartTimer} onCheckedChange={onAutoStart} />
      </div>
      <div className="mx-4 h-px bg-white/5" />
      <div className="flex h-[56px] items-center justify-between px-4">
        <Label htmlFor="hide-spy" className="flex items-center gap-2 text-sm">
          {hideSpyCount ? (
            <EyeOff className="h-3.5 w-3.5 text-[#8E8E93]" />
          ) : (
            <Eye className="h-3.5 w-3.5 text-[#8E8E93]" />
          )}
          {t.config.hideSpyCount}
        </Label>
        <Switch id="hide-spy" checked={hideSpyCount} onCheckedChange={onHideSpy} />
      </div>
      <div className="mx-4 h-px bg-white/5" />
      <div className="flex h-[56px] items-center justify-between px-4">
        <Label htmlFor="moderator" className="flex items-center gap-2 text-sm">
          <Shield className="h-3.5 w-3.5 text-[#8E8E93]" /> {t.config.moderatorMode}
        </Label>
        <Switch id="moderator" checked={moderatorMode} onCheckedChange={onModerator} />
      </div>
    </div>
  );
});

/* -- Main component ----------------------------------------- */

export const GameConfig = memo(function GameConfig({
  roomCode,
  playerId,
  isHost,
  timeLimit,
  spyCount,
  autoStartTimer,
  hideSpyCount,
  moderatorMode,
  selectedLocationCount,
  totalLocationCount,
  onOpenLocations,
}: GameConfigProps) {
  const queryClient = useQueryClient();
  const cacheKey = roomKeys.events(roomCode);

  const configMutation = useMutation({
    mutationFn: (patch: ConfigPatch) => updateRoomConfig({ roomCode, playerId, ...patch }),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previous = queryClient.getQueryData<RoomEvent>(cacheKey);
      if (previous) {
        queryClient.setQueryData(cacheKey, { ...previous, ...patch });
      }
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(cacheKey, context.previous);
      }
    },
  });

  const handleTimeSelect = useCallback(
    (value: number) => {
      configMutation.mutate({ timeLimit: value });
    },
    [configMutation],
  );
  const handleSpySelect = useCallback(
    (count: number) => {
      configMutation.mutate({ spyCount: count });
    },
    [configMutation],
  );
  const handleAutoStart = useCallback(
    (checked: boolean) => {
      configMutation.mutate({ autoStartTimer: checked });
    },
    [configMutation],
  );
  const handleHideSpy = useCallback(
    (checked: boolean) => {
      configMutation.mutate({ hideSpyCount: checked });
    },
    [configMutation],
  );
  const handleModerator = useCallback(
    (checked: boolean) => {
      configMutation.mutate({ moderatorMode: checked });
    },
    [configMutation],
  );

  const { t } = useTranslation();

  if (!isHost) {
    return (
      <GameConfigSummary
        timeLimit={timeLimit}
        spyCount={spyCount}
        selectedLocationCount={selectedLocationCount}
        totalLocationCount={totalLocationCount}
        moderatorMode={moderatorMode}
      />
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
        <Settings className="mr-1 inline h-3 w-3" /> {t.config.gameSettings}
      </p>
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
          <Clock className="mr-1 inline h-3 w-3" /> {t.config.timer}
        </p>
        <div className="flex gap-1.5">
          {TIMER_PRESETS.map((preset) => (
            <PresetButton
              key={preset.value}
              label={preset.label}
              value={preset.value}
              isSelected={timeLimit === preset.value}
              onClick={handleTimeSelect}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.08em] text-[#48484A] uppercase">{t.config.spies}</p>
        <div className="flex gap-1.5">
          {SPY_OPTIONS.map((count) => (
            <PresetButton
              key={count}
              label={`${count} ${count === 1 ? t.config.spy : t.config.spiesPlural}`}
              value={count}
              isSelected={spyCount === count}
              onClick={handleSpySelect}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
          {t.config.locations}
        </p>
        <button
          onClick={onOpenLocations}
          className="flex h-[56px] w-full items-center justify-between rounded-2xl bg-[#141414] px-4 text-sm transition-colors hover:bg-[#1C1C1E]"
        >
          <span>
            {selectedLocationCount} / {totalLocationCount} {t.config.locationsSelected}
          </span>
          <span className="text-[#48484A]">{t.config.edit} &rarr;</span>
        </button>
      </div>
      <ConfigToggles
        autoStartTimer={autoStartTimer}
        hideSpyCount={hideSpyCount}
        moderatorMode={moderatorMode}
        onAutoStart={handleAutoStart}
        onHideSpy={handleHideSpy}
        onModerator={handleModerator}
      />
    </div>
  );
});
