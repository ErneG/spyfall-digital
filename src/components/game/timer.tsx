"use client";

import { memo, useMemo } from "react";
import { Clock, Pause } from "lucide-react";

interface TimerProps {
  display: string;
  isExpired: boolean;
  isPaused?: boolean;
}

export const Timer = memo(function Timer({ display, isExpired, isPaused }: TimerProps) {
  const timerClassName = useMemo(() => {
    const base = "flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-center font-mono text-3xl font-bold transition-colors";
    if (isExpired) return `${base} bg-destructive/10 text-destructive animate-pulse`;
    if (isPaused) return `${base} bg-yellow-500/10 text-yellow-500`;
    return `${base} bg-muted`;
  }, [isExpired, isPaused]);

  return (
    <div className={timerClassName}>
      {isPaused ? <Pause className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
      {display}
    </div>
  );
});
