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
      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      {isHost ? (
        <div className="space-y-2">
          <Button
            className="w-full h-12 text-lg"
            onClick={onStart}
            disabled={isStarting || playerCount < 3}
          >
            {isStarting ? t.home.starting : t.home.startGame}
          </Button>
          {playerCount < 3 && (
            <p className="text-xs text-muted-foreground text-center">
              {t.players.needMinPlayers}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          {t.players.waitingForHost}
        </p>
      )}
    </>
  );
});
