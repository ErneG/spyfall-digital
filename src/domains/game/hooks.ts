"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { gameViewSchema, type GameView } from "@/domains/game/schema";

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
      const json: unknown = await res.json();
      const parsed = gameViewSchema.safeParse(json);
      if (!parsed.success) {
        setError("Invalid game data received");
        return;
      }
      setGame(parsed.data);
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

function computeRemaining(startedAt: string | null, timeLimit: number): number {
  if (!startedAt) return timeLimit;
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  return Math.max(0, timeLimit - elapsed);
}

export function useTimer(startedAt: string | null, timeLimit: number, running: boolean = true) {
  const [remaining, setRemaining] = useState(() => computeRemaining(startedAt, timeLimit));
  const [isExpired, setIsExpired] = useState(() => computeRemaining(startedAt, timeLimit) === 0);

  const tick = useCallback(() => {
    if (!startedAt || !running) return;
    const left = computeRemaining(startedAt, timeLimit);
    setRemaining(left);
    if (left === 0) setIsExpired(true);
  }, [startedAt, timeLimit, running]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick, running]);

  const display = useMemo(() => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [remaining]);

  return { remaining, isExpired, display };
}
