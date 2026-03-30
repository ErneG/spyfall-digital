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
    <div className="space-y-3 text-center">
      <p className="text-[11px] tracking-[0.08em] text-[#48484A] uppercase">{t.room.roomCode}</p>
      <button
        onClick={onCopy}
        className="inline-flex cursor-pointer items-center gap-3 font-mono text-4xl font-bold tracking-[0.3em] text-white transition-colors hover:text-white/80"
      >
        {code.toUpperCase()}
        {isCopied ? (
          <Check className="h-5 w-5 text-[#34D399]" />
        ) : (
          <Copy className="h-5 w-5 text-[#48484A]" />
        )}
      </button>
      <div className="flex items-center justify-center gap-2 text-xs">
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 text-[#34D399]" />{" "}
            <span className="text-[#34D399]">{t.room.connected}</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-[#EF4444]" />{" "}
            <span className="text-[#EF4444]">{t.room.reconnecting}</span>
          </>
        )}
      </div>
    </div>
  );
});
