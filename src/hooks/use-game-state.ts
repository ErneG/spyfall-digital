"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { GameView } from "@/types/game";

const POLL_INTERVAL = 5000; // 5s — reduced from 2s

export function useGameState(gameId: string | null, playerId: string | null) {
  const [game, setGame] = useState<GameView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchGame = useCallback(async () => {
    if (!gameId || !playerId) return;

    try {
      const res = await fetch(`/api/games/${gameId}?playerId=${playerId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to fetch game");
        return;
      }
      const data = await res.json();
      setGame(data);
      setError(null);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }, [gameId, playerId]);

  useEffect(() => {
    void fetchGame();

    // Clean up previous interval before setting a new one
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => void fetchGame(), POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchGame]);

  return { game, loading, error, refetch: fetchGame };
}
