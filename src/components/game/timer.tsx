"use client";

import { Clock } from "lucide-react";

interface TimerProps {
  display: string;
  expired: boolean;
}

export function Timer({ display, expired }: TimerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-center font-mono text-3xl font-bold transition-colors ${
        expired
          ? "bg-destructive/10 text-destructive animate-pulse"
          : "bg-muted"
      }`}
    >
      <Clock className="h-5 w-5" />
      {display}
    </div>
  );
}
