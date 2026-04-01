"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { toggleTimer, endGame, restartGame } from "@/domains/game/actions";
import { gameKeys } from "@/domains/game/hooks";
import { unwrapAction } from "@/shared/lib/unwrap-action";

const BEEP_FREQUENCY = 800;
const BEEP_VOLUME = 0.3;
const BEEP_GAP = 0.3;
const BEEP_DURATION = 0.15;
const BEEP_COUNT = 2;

export function useExpiryBeep(isExpired: boolean) {
  const hasBeeped = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isExpired && !hasBeeped.current) {
      hasBeeped.current = true;
      try {
        audioCtxRef.current ??= new AudioContext();
        const ctx = audioCtxRef.current;
        for (let i = 0; i < BEEP_COUNT; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = BEEP_FREQUENCY;
          gain.gain.value = BEEP_VOLUME;
          osc.start(ctx.currentTime + i * BEEP_GAP);
          osc.stop(ctx.currentTime + i * BEEP_GAP + BEEP_DURATION);
        }
      } catch {
        // Audio not available
      }
    }
  }, [isExpired]);
}

export function useGameActions(gameId: string, playerId: string) {
  const queryClient = useQueryClient();
  const queryKey = gameKeys.state(gameId, playerId);

  const timerMutation = useMutation({
    mutationFn: (isCurrentlyRunning: boolean) =>
      toggleTimer({ gameId, playerId, action: isCurrentlyRunning ? "pause" : "resume" }).then(
        unwrapAction,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const endMutation = useMutation({
    mutationFn: () => endGame({ gameId, playerId }).then(unwrapAction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const restartMutation = useMutation({
    mutationFn: () => restartGame({ gameId, playerId }).then(unwrapAction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { timerMutation, endMutation, restartMutation };
}
