"use client";

import { useState, useCallback } from "react";

import { fetchPlayerRole, type PeekRole } from "@/domains/game/hooks";

type RevealStep = "handoff" | "card";

export function useRoleReveal(gameId: string, players: Array<{ id: string; name: string }>) {
  const [playerIndex, setPlayerIndex] = useState(0);
  const [step, setStep] = useState<RevealStep>("handoff");
  const [role, setRole] = useState<PeekRole | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);
  const [isAllDone, setIsAllDone] = useState(false);

  const currentPlayer = players[playerIndex];
  const isLast = playerIndex === players.length - 1;
  const remaining = players.length - playerIndex - 1;

  const handleReady = useCallback(() => {
    setHasFetchError(false);
    setStep("card");
  }, []);

  const handleFlip = useCallback(async () => {
    if (isFlipped || isLoading) {
      return;
    }

    setIsLoading(true);
    setHasFetchError(false);

    try {
      const fetched = await fetchPlayerRole(gameId, currentPlayer.id);
      if (fetched) {
        setRole(fetched);
        setIsFlipped(true);
        return;
      }

      setHasFetchError(true);
    } catch {
      setRole(null);
      setIsFlipped(false);
      setHasFetchError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isFlipped, isLoading, gameId, currentPlayer.id]);

  const handleNext = useCallback(() => {
    if (isLast) {
      setIsAllDone(true);
    } else {
      setPlayerIndex((previous) => previous + 1);
      setStep("handoff");
      setRole(null);
      setIsFlipped(false);
      setHasFetchError(false);
    }
  }, [isLast]);

  return {
    playerIndex,
    step,
    role,
    isFlipped,
    isLoading,
    hasFetchError,
    isAllDone,
    currentPlayer,
    isLast,
    remaining,
    handleReady,
    handleFlip,
    handleNext,
  };
}

export type { RevealStep };
