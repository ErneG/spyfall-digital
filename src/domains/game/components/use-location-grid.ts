"use client";

import { useState, useCallback } from "react";

import { endGame } from "@/domains/game/actions";

import type { LocationInfo } from "@/domains/game/schema";

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
  const isSpy = !!gameId;

  const toggleCrossOut = useCallback((locId: string) => {
    setCrossedOut((previous) => {
      const next = new Set(previous);
      if (next.has(locId)) {
        next.delete(locId);
      } else {
        next.add(locId);
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
  }, [gameId, playerId, guessTarget]);

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
