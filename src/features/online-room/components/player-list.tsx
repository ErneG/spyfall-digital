"use client";

import { Crown } from "lucide-react";
import React from "react";

import { useTranslation } from "@/shared/i18n/context";

import type { PlayerInfo } from "@/shared/types/common";

interface PlayerListProps {
  players: PlayerInfo[];
  currentPlayerId: string;
}

export const PlayerList = React.memo(function PlayerList({
  players,
  currentPlayerId,
}: PlayerListProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/78 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
      <div className="px-5 pt-5 pb-3">
        <p className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">
          {t.players.title} ({players.length}/12)
        </p>
      </div>
      <div>
        {players.map((player, index) => (
          <div key={player.id}>
            {index > 0 && <div className="mx-5 h-px bg-slate-200/80" />}
            <div className="flex min-h-[68px] items-center justify-between px-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    player.id === currentPlayerId
                      ? "bg-sky-100 text-sky-800"
                      : "bg-slate-100 text-slate-500"
                  } text-sm font-semibold`}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-slate-950">
                  {player.name}
                  {player.id === currentPlayerId && (
                    <span className="ml-1 text-sky-700">{t.players.you}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {player.isHost && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                    <Crown className="mr-1 inline h-3 w-3" /> {t.players.host}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">{t.players.waitingForPlayers}</p>
        )}
      </div>
    </div>
  );
});
