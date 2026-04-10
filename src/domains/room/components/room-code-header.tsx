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
    <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 text-center shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
      <p className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">{t.room.roomCode}</p>
      <button
        onClick={onCopy}
        className="mt-3 inline-flex cursor-pointer items-center gap-3 font-mono text-4xl font-semibold tracking-[0.3em] text-slate-950 transition hover:text-slate-700"
      >
        {code.toUpperCase()}
        {isCopied ? (
          <Check className="h-5 w-5 text-emerald-600" />
        ) : (
          <Copy className="h-5 w-5 text-slate-400" />
        )}
      </button>
      <div className="mt-4 flex items-center justify-center gap-2 text-xs">
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 text-emerald-600" />{" "}
            <span className="font-medium text-emerald-700">{t.room.connected}</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-rose-500" />{" "}
            <span className="font-medium text-rose-600">{t.room.reconnecting}</span>
          </>
        )}
      </div>
    </div>
  );
});
