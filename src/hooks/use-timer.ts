"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

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
