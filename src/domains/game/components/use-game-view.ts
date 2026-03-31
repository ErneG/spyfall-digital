"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";

import { useExpiryBeep, useGameActions } from "@/domains/game/components/game-view-parts";
import { useGameState, useTimer } from "@/domains/game/hooks";
import { useSession } from "@/shared/hooks/use-session";
import { useTranslation } from "@/shared/i18n/context";

interface UseGameViewOptions {
  gameId: string;
  playerId: string;
  isHost: boolean;
  timeLimit: number;
  gameStartedAt: string | null;
  hideSpyCount: boolean;
  spyCount: number;
  isTimerRunning: boolean;
  players?: Array<{ id: string; name: string; isHost: boolean; isOnline: boolean }>;
}

export function useGameView({
  gameId,
  playerId,
  timeLimit,
  gameStartedAt,
  hideSpyCount,
  spyCount,
  isTimerRunning: initialTimerRunning,
  players: roomPlayers,
}: UseGameViewOptions) {
  const { t } = useTranslation();
  const router = useRouter();
  const { clearSession } = useSession();
  const { game, isLoading } = useGameState(gameId, playerId);
  const isTimerRunning = game?.timerRunning ?? initialTimerRunning;
  const startedAt = game?.startedAt ?? gameStartedAt;
  const effectiveTimeLimit = game?.timeLimit ?? timeLimit;
  const { display, isExpired } = useTimer(startedAt, effectiveTimeLimit, isTimerRunning);
  const [isRoleRevealed, setIsRoleRevealed] = useState(false);
  const { timerMutation, endMutation, restartMutation } = useGameActions(gameId, playerId);

  useExpiryBeep(isExpired);

  const onTimerToggle = useCallback(() => {
    timerMutation.mutate(isTimerRunning);
  }, [timerMutation, isTimerRunning]);

  const onEndGameClick = useCallback(() => {
    endMutation.mutate();
  }, [endMutation]);

  const onRestart = useCallback(() => {
    restartMutation.mutate();
  }, [restartMutation]);

  const handleLeave = useCallback(() => {
    clearSession();
    router.push("/");
  }, [clearSession, router]);

  const toggleRole = useCallback(() => {
    setIsRoleRevealed((previous) => !previous);
  }, []);

  const spyCountLabel = useMemo(() => {
    if (hideSpyCount) {
      return null;
    }
    return spyCount === 1 ? "1 spy among you" : `${spyCount} spies among you`;
  }, [hideSpyCount, spyCount]);

  return {
    t,
    game,
    isLoading,
    isTimerRunning,
    display,
    isExpired,
    isRoleRevealed,
    endMutation,
    roomPlayers,
    spyCountLabel,
    onTimerToggle,
    onEndGameClick,
    onRestart,
    handleLeave,
    toggleRole,
  };
}
