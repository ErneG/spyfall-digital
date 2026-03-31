"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/shared/i18n/context";

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
      {error && <p className="text-center text-[13px] text-[#EF4444]">{error}</p>}

      {isHost ? (
        <div className="space-y-3">
          <Button
            className="h-[52px] w-full rounded-2xl bg-white text-lg font-semibold text-black hover:bg-white/90"
            onClick={onStart}
            disabled={isStarting || playerCount < 3}
          >
            {isStarting ? t.home.starting : t.home.startGame}
          </Button>
          {playerCount < 3 && (
            <p className="text-center text-xs text-[#48484A]">{t.players.needMinPlayers}</p>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-[#8E8E93]">{t.players.waitingForHost}</p>
      )}
    </>
  );
});
