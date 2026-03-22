"use client";

import { useEffect, useState, useCallback } from "react";
import type { GameView } from "@/types/game";

export function useGameState(gameId: string | null, playerId: string | null) {
  const [game, setGame] = useState<GameView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Poll every 2s for game state
  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [fetchGame]);

  return { game, loading, error, refetch: fetchGame };
}
