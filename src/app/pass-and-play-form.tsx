"use client";

import React from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

import { EditionPicker } from "./edition-picker";
import { GameConfigSection } from "./game-config-section";
import { PlayerListSection } from "./pass-and-play-form-parts";

/* ── Exported form component ─────────────────────────── */

export interface PassAndPlayFormProps {
  playerNames: string[];
  timeLimit: number;
  spyCount: number;
  hideSpyCount: boolean;
  editions: Array<1 | 2>;
  error: string;
  isLoading: boolean;
  onPlayerNameChange: (index: number, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onReorderPlayers: (newNames: string[]) => void;
  onTimeLimitChange: (value: number) => void;
  onSpyCountChange: (value: number) => void;
  onHideSpyCountChange: (checked: boolean) => void;
  onEditionsChange: (editions: Array<1 | 2>) => void;
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
  onReorderPlayers,
  onTimeLimitChange,
  onSpyCountChange,
  onHideSpyCountChange,
  editions,
  onEditionsChange,
  onBack,
  onStart,
}: PassAndPlayFormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t.home.passAndPlay}</h2>
        <p className="text-muted-foreground text-[13px]">{t.home.passAndPlayDesc}</p>
      </div>
      <div className="space-y-4">
        <PlayerListSection
          playerNames={playerNames}
          onPlayerNameChange={onPlayerNameChange}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onReorderPlayers={onReorderPlayers}
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
        <div className="h-px bg-white/5" />
        <EditionPicker editions={editions} onChange={onEditionsChange} />
        {error && (
          <p className="text-spy-red text-[13px]">
            {t.errors[error as keyof typeof t.errors] ?? error}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
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
