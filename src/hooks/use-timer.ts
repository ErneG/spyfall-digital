"use client";

import { useState, useEffect, useCallback } from "react";

export function useTimer(startedAt: string | null, timeLimit: number, running: boolean = true) {
  const [remaining, setRemaining] = useState(timeLimit);
  const [expired, setExpired] = useState(false);

  const tick = useCallback(() => {
    if (!startedAt || !running) return;
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const left = Math.max(0, timeLimit - elapsed);
    setRemaining(left);
    if (left === 0) setExpired(true);
  }, [startedAt, timeLimit, running]);

  useEffect(() => {
    tick();
    if (!running) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick, running]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return { remaining, expired, display };
}
