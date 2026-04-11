"use client";

import { Pause } from "lucide-react";
import { memo, useMemo } from "react";

interface TimerProps {
  display: string;
  isExpired: boolean;
  isPaused?: boolean;
  variant?: "hero" | "compact";
}

export const Timer = memo(function Timer({
  display,
  isExpired,
  isPaused,
  variant = "compact",
}: TimerProps) {
  const timerClassName = useMemo(() => {
    if (variant === "hero") {
      const base =
        "flex items-center justify-center gap-4 py-8 text-center font-mono font-light tracking-tight transition-colors";
      const size = "text-8xl";
      if (isExpired) {
        return `${base} ${size} text-spy-red animate-pulse`;
      }
      if (isPaused) {
        return `${base} ${size} text-slate-400`;
      }
      return `${base} ${size} text-slate-950`;
    }

    const base =
      "flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-center font-mono text-[52px] font-light tracking-tight transition-colors";
    if (isExpired) {
      return `${base} text-spy-red animate-pulse`;
    }
    if (isPaused) {
      return `${base} text-slate-400`;
    }
    return `${base} text-slate-950`;
  }, [isExpired, isPaused, variant]);

  return (
    <div className={timerClassName}>
      {isPaused && <Pause className={variant === "hero" ? "h-10 w-10" : "h-6 w-6"} />}
      {display}
    </div>
  );
});
