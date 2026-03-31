"use client";

import { Plus, X } from "lucide-react";
import React, { useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/shared/lib/constants";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { GameConfigSection } from "./game-config-section";

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

/* ── Player list section ─────────────────────────────── */

interface PlayerListSectionProps {
  playerNames: string[];
  onPlayerNameChange: (index: number, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
}

const PlayerListSection = React.memo(function PlayerListSection({
  playerNames,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
}: PlayerListSectionProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="space-y-2">
        {playerNames.map((name, index) => (
          <PlayerNameRow
            key={`player-${String(index)}`}
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
    </>
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
        <PlayerListSection
          playerNames={playerNames}
          onPlayerNameChange={onPlayerNameChange}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
        />
        <div className="h-px bg-white/5" />
        <GameConfigSection
          timeLimit={timeLimit}
          spyCount={spyCount}
          hideSpyCount={hideSpyCount}
          onTimeLimitChange={onTimeLimitChange}
          onSpyCountChange={onSpyCountChange}
          onHideSpyCountChange={onHideSpyCountChange}
        />
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
