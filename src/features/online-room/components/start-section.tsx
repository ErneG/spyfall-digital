"use client";

import React from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

interface StartSectionProps {
  isHost: boolean;
  isStarting: boolean;
  playerCount: number;
  error: string;
  onStart: () => void;
}

export const StartSection = React.memo(function StartSection({
  isHost,
  isStarting,
  playerCount,
  error,
  onStart,
}: StartSectionProps) {
  const { t } = useTranslation();
  return (
    <>
      {error ? <p className="text-center text-[13px] text-rose-600">{error}</p> : null}

      {isHost ? (
        <div className="space-y-3 rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
          <Button
            className="h-[56px] w-full rounded-[22px] border border-slate-950/5 bg-slate-950 text-lg font-semibold text-white shadow-[0_18px_30px_rgba(15,23,42,0.18)] hover:bg-slate-900"
            onClick={onStart}
            disabled={isStarting || playerCount < 3}
          >
            {isStarting ? t.home.starting : t.home.startGame}
          </Button>
          {playerCount < 3 && (
            <p className="text-center text-xs text-slate-500">{t.players.needMinPlayers}</p>
          )}
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 text-center shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
          <p className="text-sm text-slate-500">{t.players.waitingForHost}</p>
        </div>
      )}
    </>
  );
});
