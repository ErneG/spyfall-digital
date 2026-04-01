"use client";

import { useState, useCallback } from "react";

import { fetchPlayerRole, type PeekRole } from "@/domains/game/hooks";

type RevealStep = "handoff" | "ready" | "revealed";

export function useRoleReveal(gameId: string, players: Array<{ id: string; name: string }>) {
  const [playerIndex, setPlayerIndex] = useState(0);
  const [step, setStep] = useState<RevealStep>("handoff");
  const [role, setRole] = useState<PeekRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);
  const [isAllDone, setIsAllDone] = useState(false);

  const currentPlayer = players[playerIndex];
  const isLast = playerIndex === players.length - 1;

  const handleReady = useCallback(() => {
    setStep("ready");
  }, []);

  const revealRole = useCallback(async () => {
    setIsLoading(true);
    setHasFetchError(false);
    const fetched = await fetchPlayerRole(gameId, currentPlayer.id);
    if (fetched) {
      setRole(fetched);
      setStep("revealed");
    } else {
      setHasFetchError(true);
    }
    setIsLoading(false);
  }, [gameId, currentPlayer.id]);

  const handleRevealClick = useCallback(() => {
    void revealRole();
  }, [revealRole]);

  const handleNext = useCallback(() => {
    if (isLast) {
      setIsAllDone(true);
    } else {
      setPlayerIndex((previous) => previous + 1);
      setStep("handoff");
      setRole(null);
    }
  }, [isLast]);

  return {
    playerIndex,
    step,
    role,
    isLoading,
    hasFetchError,
    isAllDone,
    currentPlayer,
    isLast,
    handleReady,
    handleRevealClick,
    handleNext,
  };
}

export type { RevealStep };
