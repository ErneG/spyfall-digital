"use client";

import React from "react";
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
            {isStarting ? "Starting..." : "Start Game"}
          </Button>
          {playerCount < 3 && (
            <p className="text-xs text-muted-foreground text-center">
              Need at least 3 players to start
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Waiting for the host to start the game...
        </p>
      )}
    </>
  );
});
