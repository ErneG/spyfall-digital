"use client";

import { memo } from "react";
import { Clock, Pause } from "lucide-react";

interface TimerProps {
  display: string;
  expired: boolean;
  paused?: boolean;
}

export const Timer = memo(function Timer({ display, expired, paused }: TimerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-center font-mono text-3xl font-bold transition-colors ${
        expired
          ? "bg-destructive/10 text-destructive animate-pulse"
          : paused
            ? "bg-yellow-500/10 text-yellow-500"
            : "bg-muted"
      }`}
    >
      {paused ? <Pause className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
      {display}
    </div>
  );
});
