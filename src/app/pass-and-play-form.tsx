"use client";

import React from "react";

import { type PlayerDraft } from "@/features/pass-and-play/player-drafts";
import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

import { GameConfigSection } from "./game-config-section";
import { PlayerListSection } from "./pass-and-play-form-parts";

/* ── Exported form component ─────────────────────────── */

export interface PassAndPlayFormProps {
  players: PlayerDraft[];
  timeLimit: number;
  spyCount: number;
  hideSpyCount: boolean;
  error: string;
  isLoading: boolean;
  sourceSection?: React.ReactNode;
  onPlayerNameChange: (id: string, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (id: string) => void;
  onReorderPlayers: (players: PlayerDraft[]) => void;
  onTimeLimitChange: (value: number) => void;
  onSpyCountChange: (value: number) => void;
  onHideSpyCountChange: (checked: boolean) => void;
  onBack: () => void;
  onStart: () => void;
}

export const PassAndPlayForm = React.memo(function PassAndPlayForm({
  players,
  timeLimit,
  spyCount,
  hideSpyCount,
  error,
  isLoading,
  sourceSection,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  onReorderPlayers,
  onTimeLimitChange,
  onSpyCountChange,
  onHideSpyCountChange,
  onBack,
  onStart,
}: PassAndPlayFormProps) {
  const { t } = useTranslation();
  const translatedError = Object.hasOwn(t.errors, error)
    ? t.errors[error as keyof typeof t.errors]
    : error;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-950">{t.home.passAndPlay}</h2>
        <p className="text-[13px] text-slate-500">{t.home.passAndPlayDesc}</p>
      </div>
      <div className="space-y-4">
        <PlayerListSection
          players={players}
          onPlayerNameChange={onPlayerNameChange}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onReorderPlayers={onReorderPlayers}
        />
        <div className="h-px bg-slate-200/90" />
        <GameConfigSection
          timeLimit={timeLimit}
          spyCount={spyCount}
          hideSpyCount={hideSpyCount}
          onTimeLimitChange={onTimeLimitChange}
          onSpyCountChange={onSpyCountChange}
          onHideSpyCountChange={onHideSpyCountChange}
        />
        <div className="h-px bg-slate-200/90" />
        {sourceSection}
        {error && <p className="text-[13px] text-rose-600">{translatedError}</p>}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="text-slate-500 hover:bg-slate-900/5">
            {t.common.back}
          </Button>
          <Button
            className="h-[52px] flex-1 rounded-2xl border border-slate-950/5 bg-slate-950 font-semibold text-white shadow-[0_18px_30px_rgba(15,23,42,0.18)] hover:bg-slate-900"
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
