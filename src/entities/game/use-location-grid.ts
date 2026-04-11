"use client";

import { useCallback, useState } from "react";

import { endGame } from "@/entities/game/actions";

import type { LocationInfo } from "./schema";

interface LocationGridParams {
  locations: LocationInfo[];
  revealedLocation: string | null;
  previousLocationName: string | null;
  gameId?: string;
  playerId?: string;
}

export function useLocationGrid(params: LocationGridParams) {
  const { gameId, playerId } = params;
  const [guessTarget, setGuessTarget] = useState<LocationInfo | null>(null);
  const [isGuessing, setIsGuessing] = useState(false);
  const [crossedOut, setCrossedOut] = useState<Set<string>>(new Set());
  const isSpy = Boolean(gameId);

  const toggleCrossOut = useCallback((locationId: string) => {
    setCrossedOut((previous) => {
      const next = new Set(previous);
      if (next.has(locationId)) {
        next.delete(locationId);
      } else {
        next.add(locationId);
      }
      return next;
    });
  }, []);

  const handleGuess = useCallback(async () => {
    if (!gameId || !playerId || !guessTarget) {
      return;
    }
    setIsGuessing(true);
    try {
      await endGame({ gameId, playerId, spyGuessLocationId: guessTarget.id });
    } finally {
      setIsGuessing(false);
      setGuessTarget(null);
    }
  }, [gameId, guessTarget, playerId]);

  const handleCancelGuess = useCallback(() => setGuessTarget(null), []);
  const handleConfirmGuess = useCallback(() => {
    handleGuess().catch(() => {});
  }, [handleGuess]);

  return {
    guessTarget,
    isGuessing,
    crossedOut,
    isSpy,
    setGuessTarget,
    toggleCrossOut,
    handleCancelGuess,
    handleConfirmGuess,
  };
}
