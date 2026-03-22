"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { GameView } from "@/types/game";

const POLL_INTERVAL = 5000; // 5s — reduced from 2s

export function useGameState(gameId: string | null, playerId: string | null) {
  const [game, setGame] = useState<GameView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchGame = useCallback(async () => {
    if (!gameId || !playerId) return;

    try {
      const res = await fetch(`/api/games/${gameId}?playerId=${playerId}`);
      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        setError(errorData.error ?? "Failed to fetch game");
        return;
      }
      const data = (await res.json()) as GameView;
      setGame(data);
      setError(null);
    } catch {
      setError("Connection error");
    } finally {
      setIsLoading(false);
    }
  }, [gameId, playerId]);

  useEffect(() => {
    let isActive = true;
    const run = async () => {
      if (isActive) await fetchGame();
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    run();

    // Clean up previous interval before setting a new one
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      run();
    }, POLL_INTERVAL);

    return () => {
      isActive = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchGame]);

  return { game, isLoading, error, refetch: fetchGame };
}
