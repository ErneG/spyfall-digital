"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { gameViewSchema, type GameView } from "@/domains/game/schema";

// ─── Query key factory ──────────────────────────────────────

export const gameKeys = {
  all: ["game"] as const,
  state: (gameId: string, playerId: string) => ["game", gameId, playerId] as const,
  playerRole: (gameId: string, playerId: string) => ["game", gameId, "role", playerId] as const,
} as const;

// ─── Shared fetch functions ─────────────────────────────────

const POLL_INTERVAL = 5000;

async function fetchGameState(gameId: string, playerId: string): Promise<GameView> {
  const res = await fetch(`/api/games/${gameId}?playerId=${playerId}`);
  if (!res.ok) {
    const errorData = (await res.json()) as { error?: string };
    throw new Error(errorData.error ?? "Failed to fetch game");
  }
  const json: unknown = await res.json();
  return gameViewSchema.parse(json);
}

export interface PeekRole {
  myRole: string;
  isSpy: boolean;
  location: string | null;
}

export async function fetchPlayerRole(gameId: string, playerId: string): Promise<PeekRole | null> {
  try {
    const res = await fetch(`/api/games/${gameId}?playerId=${playerId}`);
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const parsed = gameViewSchema.safeParse(json);
    if (!parsed.success) return null;
    return { myRole: parsed.data.myRole, isSpy: parsed.data.isSpy, location: parsed.data.location };
  } catch {
    return null;
  }
}

// ─── Hooks ──────────────────────────────────────────────────

export function useGameState(gameId: string | null, playerId: string | null) {
  const { data: game = null, isLoading, error, refetch } = useQuery({
    queryKey: gameKeys.state(gameId ?? "", playerId ?? ""),
    queryFn: () => fetchGameState(gameId!, playerId!),
    enabled: Boolean(gameId && playerId),
    refetchInterval: POLL_INTERVAL,
  });

  return { game, isLoading, error: error?.message ?? null, refetch };
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
