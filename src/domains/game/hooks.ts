"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useMemo } from "react";

import { getGameState } from "@/domains/game/actions";
import { type GameView } from "@/domains/game/schema";
import { unwrapAction } from "@/shared/lib/unwrap-action";

// ─── Query key factory ──────────────────────────────────────

export const gameKeys = {
  all: ["game"] as const,
  state: (gameId: string, playerId: string) => ["game", gameId, playerId] as const,
  playerRole: (gameId: string, playerId: string) => ["game", gameId, "role", playerId] as const,
} as const;

// ─── Shared fetch functions ─────────────────────────────────

const POLL_INTERVAL = 5000;

async function fetchGameState(gameId: string, playerId: string): Promise<GameView> {
  const result = await getGameState(gameId, playerId);
  return unwrapAction(result);
}

export interface PeekRole {
  myRole: string;
  isSpy: boolean;
  location: string | null;
}

export async function fetchPlayerRole(gameId: string, playerId: string): Promise<PeekRole | null> {
  try {
    const result = await getGameState(gameId, playerId);
    if (!result.success) {
      return null;
    }
    return { myRole: result.data.myRole, isSpy: result.data.isSpy, location: result.data.location };
  } catch {
    return null;
  }
}

// ─── Hooks ──────────────────────────────────────────────────

export function useGameState(gameId: string | null, playerId: string | null) {
  const {
    data: game = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: gameKeys.state(gameId ?? "", playerId ?? ""),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guarded by enabled
    queryFn: () => fetchGameState(gameId!, playerId!),
    enabled: Boolean(gameId && playerId),
    refetchInterval: POLL_INTERVAL,
  });

  return { game, isLoading, error: error?.message ?? null, refetch };
}

function computeRemaining(startedAt: string | null, timeLimit: number): number {
  if (!startedAt) {
    return timeLimit;
  }
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  return Math.max(0, timeLimit - elapsed);
}

export function useTimer(startedAt: string | null, timeLimit: number, running: boolean = true) {
  const [remaining, setRemaining] = useState(() => computeRemaining(startedAt, timeLimit));
  const [isExpired, setIsExpired] = useState(() => computeRemaining(startedAt, timeLimit) === 0);

  const tick = useCallback(() => {
    if (!startedAt || !running) {
      return;
    }
    const left = computeRemaining(startedAt, timeLimit);
    setRemaining(left);
    if (left === 0) {
      setIsExpired(true);
    }
  }, [startedAt, timeLimit, running]);

  useEffect(() => {
    if (!running) {
      return;
    }
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
