"use client";

import { Copy, Check, Wifi, WifiOff } from "lucide-react";
import React from "react";

import { useTranslation } from "@/shared/i18n/context";

interface RoomCodeHeaderProps {
  code: string;
  isCopied: boolean;
  isConnected: boolean;
  onCopy: () => void;
}

export const RoomCodeHeader = React.memo(function RoomCodeHeader({
  code,
  isCopied,
  isConnected,
  onCopy,
}: RoomCodeHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 text-center">
      <p className="text-muted-foreground/60 text-[11px] tracking-[0.08em] uppercase">
        {t.room.roomCode}
      </p>
      <button
        onClick={onCopy}
        className="inline-flex cursor-pointer items-center gap-3 font-mono text-4xl font-bold tracking-[0.3em] text-white transition-colors hover:text-white/80"
      >
        {code.toUpperCase()}
        {isCopied ? (
          <Check className="text-success h-5 w-5" />
        ) : (
          <Copy className="text-muted-foreground/60 h-5 w-5" />
        )}
      </button>
      <div className="flex items-center justify-center gap-2 text-xs">
        {isConnected ? (
          <>
            <Wifi className="text-success h-3 w-3" />{" "}
            <span className="text-success">{t.room.connected}</span>
          </>
        ) : (
          <>
            <WifiOff className="text-spy-red h-3 w-3" />{" "}
            <span className="text-spy-red">{t.room.reconnecting}</span>
          </>
        )}
      </div>
    </div>
  );
});
