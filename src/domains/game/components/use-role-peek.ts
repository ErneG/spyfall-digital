"use client";

import { useCallback, useState } from "react";

import { fetchPlayerRole, type PeekRole } from "@/domains/game/hooks";

export type RolePeekStep = "handoff" | "picker" | "reveal";

function getInitialState() {
  return {
    step: "handoff" as RolePeekStep,
    selectedPlayerId: null as string | null,
    role: null as PeekRole | null,
    isLoading: false,
    hasFetchError: false,
  };
}

export function useRolePeek(gameId: string, onExit: () => void) {
  const [step, setStep] = useState<RolePeekStep>("handoff");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [role, setRole] = useState<PeekRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);

  const resetTransientState = useCallback(() => {
    const initialState = getInitialState();
    setStep(initialState.step);
    setSelectedPlayerId(initialState.selectedPlayerId);
    setRole(initialState.role);
    setIsLoading(initialState.isLoading);
    setHasFetchError(initialState.hasFetchError);
  }, []);

  const handleOpenPicker = useCallback(() => {
    setHasFetchError(false);
    setStep("picker");
  }, []);

  const handleSelectPlayer = useCallback(
    async (playerId: string) => {
      setSelectedPlayerId(playerId);
      setIsLoading(true);
      setHasFetchError(false);

      try {
        const fetchedRole = await fetchPlayerRole(gameId, playerId);
        setRole(fetchedRole);
        setStep("reveal");
      } catch {
        setSelectedPlayerId(null);
        setRole(null);
        setStep("picker");
        setHasFetchError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [gameId],
  );

  const handleDismissReveal = useCallback(() => {
    setSelectedPlayerId(null);
    setRole(null);
    setHasFetchError(false);
    setStep("handoff");
  }, []);

  const handleExit = useCallback(() => {
    resetTransientState();
    onExit();
  }, [onExit, resetTransientState]);

  return {
    step,
    selectedPlayerId,
    role,
    isLoading,
    hasFetchError,
    handleOpenPicker,
    handleSelectPlayer,
    handleDismissReveal,
    handleExit,
  };
}
