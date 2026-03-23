"use client";

import React from "react";
import { Copy, Check, Wifi, WifiOff } from "lucide-react";
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
    <div className="text-center space-y-2">
      <p className="text-sm text-muted-foreground">{t.room.roomCode}</p>
      <button
        onClick={onCopy}
        className="inline-flex items-center gap-2 text-4xl font-mono font-bold tracking-[0.3em] hover:text-primary transition-colors cursor-pointer"
      >
        {code.toUpperCase()}
        {isCopied ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <Copy className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 text-green-500" /> {t.room.connected}
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-destructive" /> {t.room.reconnecting}
          </>
        )}
      </div>
    </div>
  );
});
