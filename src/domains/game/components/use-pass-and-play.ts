"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

import { restartGame, startGame } from "@/domains/game/actions";
import { useExpiryBeep, useGameActions } from "@/domains/game/components/game-view-parts";
import { useGameState, useTimer } from "@/domains/game/hooks";
import { useSession } from "@/shared/hooks/use-session";
import { unwrapAction } from "@/shared/lib/unwrap-action";

// ─── Types ─────────────────────────────────────────────────

export type PassAndPlayPhase = "role-reveal" | "playing";

interface PassAndPlayProps {
  gameId: string;
  hostPlayerId: string;
  roomId: string;
  timeLimit: number;
  gameStartedAt: string | null;
  isTimerRunning: boolean;
}

// ─── Main hook ─────────────────────────────────────────────

const INITIAL_PHASE: PassAndPlayPhase = "role-reveal";
const REVEAL_PHASES = new Set(["REVEAL", "FINISHED"]);

export function usePassAndPlay({
  gameId: initialGameId,
  hostPlayerId,
  roomId,
  timeLimit,
  gameStartedAt,
  isTimerRunning: initialTimerRunning,
}: PassAndPlayProps) {
  const router = useRouter();
  const { session, setSession, clearSession } = useSession();

  const [activeGameId, setActiveGameId] = useState(initialGameId);
  const [roundNumber, setRoundNumber] = useState(1);
  const { game, isLoading } = useGameState(activeGameId, hostPlayerId);

  const isTimerRunning = game?.timerRunning ?? initialTimerRunning;
  const startedAt = game?.startedAt ?? gameStartedAt;
  const effectiveTimeLimit = game?.timeLimit ?? timeLimit;

  const { display, isExpired } = useTimer(startedAt, effectiveTimeLimit, isTimerRunning);
  const { timerMutation, endMutation } = useGameActions(activeGameId, hostPlayerId);

  useExpiryBeep(isExpired);

  const [phase, setPhase] = useState<PassAndPlayPhase>(INITIAL_PHASE);

  const isServerInReveal = game ? REVEAL_PHASES.has(game.phase) : false;
  const shouldShowReveal = isServerInReveal && phase !== INITIAL_PHASE;

  const handleRoleRevealComplete = useCallback(() => {
    timerMutation.mutate(false);
    setPhase("playing");
  }, [timerMutation]);

  const onTimerToggle = useCallback(() => {
    timerMutation.mutate(isTimerRunning);
  }, [timerMutation, isTimerRunning]);

  const onEndGameClick = useCallback(() => {
    endMutation.mutate();
  }, [endMutation]);

  const handleLeave = useCallback(() => {
    clearSession();
    router.push("/");
  }, [clearSession, router]);

  // Play Again: restart old game → start new game → update session → role reveal
  const playAgainMutation = useMutation({
    mutationFn: async () => {
      await restartGame({ gameId: activeGameId, playerId: hostPlayerId }).then(unwrapAction);
      const newGame = await startGame({ roomId, playerId: hostPlayerId }).then(unwrapAction);
      return newGame;
    },
    onSuccess: (newGame) => {
      setActiveGameId(newGame.gameId);
      setRoundNumber((n) => n + 1);
      setPhase(INITIAL_PHASE);
      if (session?.mode === "pass-and-play") {
        setSession({
          ...session,
          resume: {
            ...session.resume,
            gameId: newGame.gameId,
            gameStartedAt: newGame.startedAt,
          },
        });
      }
    },
  });

  const handlePlayAgain = useCallback(() => {
    playAgainMutation.mutate();
  }, [playAgainMutation]);

  return {
    activeGameId,
    roundNumber,
    game,
    isLoading,
    phase,
    isTimerRunning,
    display,
    isExpired,
    shouldShowReveal,
    endMutation,
    playAgainMutation,
    handleRoleRevealComplete,
    onTimerToggle,
    onEndGameClick,
    handleLeave,
    handlePlayAgain,
  };
}
