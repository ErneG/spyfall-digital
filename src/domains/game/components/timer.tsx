"use client";

import { memo, useMemo } from "react";
import { Pause } from "lucide-react";

interface TimerProps {
  display: string;
  isExpired: boolean;
  isPaused?: boolean;
}

export const Timer = memo(function Timer({ display, isExpired, isPaused }: TimerProps) {
  const timerClassName = useMemo(() => {
    const base =
      "flex items-center justify-center gap-3 py-4 px-5 rounded-2xl text-center font-mono text-[52px] font-light tracking-tight transition-colors";
    if (isExpired) return `${base} text-[#EF4444] animate-pulse`;
    if (isPaused) return `${base} text-[#8E8E93]`;
    return `${base} text-white`;
  }, [isExpired, isPaused]);

  return (
    <div className={timerClassName}>
      {isPaused && <Pause className="h-6 w-6" />}
      {display}
    </div>
  );
});
