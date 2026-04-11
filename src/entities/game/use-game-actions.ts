"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { endGame, restartGame, toggleTimer } from "@/entities/game/actions";
import { gameKeys } from "@/entities/game/query";
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
        const context = audioCtxRef.current;
        for (let index = 0; index < BEEP_COUNT; index += 1) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.frequency.value = BEEP_FREQUENCY;
          gain.gain.value = BEEP_VOLUME;
          oscillator.start(context.currentTime + index * BEEP_GAP);
          oscillator.stop(context.currentTime + index * BEEP_GAP + BEEP_DURATION);
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
