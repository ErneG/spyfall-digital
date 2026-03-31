"use client";

import { Eye, EyeOff, Plus, X, Clock } from "lucide-react";
import React, { useCallback } from "react";

import { TIMER_PRESETS } from "@/domains/room/schema";
import { useTranslation } from "@/shared/i18n/context";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/shared/lib/constants";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

const SPY_OPTIONS = [1, 2] as const;

/* ── Private subcomponents ───────────────────────────── */

const PlayerNameRow = React.memo(function PlayerNameRow({
  index,
  name,
  canRemove,
  onNameChange,
  onRemove,
}: {
  index: number;
  name: string;
  canRemove: boolean;
  onNameChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const { t } = useTranslation();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onNameChange(index, event.target.value),
    [index, onNameChange],
  );
  const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);
  return (
    <div className="flex gap-2">
      <Input
        placeholder={`${t.home.playerN} ${index + 1}`}
        value={name}
        onChange={handleChange}
        maxLength={20}
        className="h-[48px] rounded-xl border-transparent bg-[#141414] text-[15px] placeholder:text-[#48484A] focus:border-transparent"
      />
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-[#8E8E93]"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

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

/* ── Exported form component ─────────────────────────── */

export interface PassAndPlayFormProps {
  playerNames: string[];
  timeLimit: number;
  spyCount: number;
  hideSpyCount: boolean;
  error: string;
  isLoading: boolean;
  onPlayerNameChange: (index: number, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onTimeLimitChange: (value: number) => void;
  onSpyCountChange: (value: number) => void;
  onHideSpyCountChange: (checked: boolean) => void;
  onBack: () => void;
  onStart: () => void;
}

export const PassAndPlayForm = React.memo(function PassAndPlayForm({
  playerNames,
  timeLimit,
  spyCount,
  hideSpyCount,
  error,
  isLoading,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  onTimeLimitChange,
  onSpyCountChange,
  onHideSpyCountChange,
  onBack,
  onStart,
}: PassAndPlayFormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t.home.passAndPlay}</h2>
        <p className="text-[13px] text-[#8E8E93]">{t.home.passAndPlayDesc}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          {playerNames.map((name, index) => (
            <PlayerNameRow
              key={index}
              index={index}
              name={name}
              canRemove={playerNames.length > MIN_PLAYERS}
              onNameChange={onPlayerNameChange}
              onRemove={onRemovePlayer}
            />
          ))}
        </div>
        {playerNames.length < MAX_PLAYERS && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-1 text-[#8E8E93]"
            onClick={onAddPlayer}
          >
            <Plus className="h-4 w-4" /> {t.home.addPlayer}
          </Button>
        )}

        <div className="h-px bg-white/5" />

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

        {error && (
          <p className="text-[13px] text-[#EF4444]">
            {t.errors[error as keyof typeof t.errors] ?? error}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="text-[#8E8E93]">
            {t.common.back}
          </Button>
          <Button
            className="h-[52px] flex-1 rounded-2xl bg-white font-semibold text-black hover:bg-white/90"
            onClick={onStart}
            disabled={isLoading}
          >
            {isLoading ? t.home.starting : t.home.startGame}
          </Button>
        </div>
      </div>
    </div>
  );
});
