"use client";

import { Crown } from "lucide-react";
import React from "react";

import { useTranslation } from "@/shared/i18n/context";

import type { PlayerInfo } from "@/domains/room/schema";


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
    <div className="rounded-2xl bg-[#141414]">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
          {t.players.title} ({players.length}/12)
        </p>
      </div>
      <div>
        {players.map((player, index) => (
          <div key={player.id}>
            {index > 0 && <div className="mx-4 h-px bg-white/5" />}
            <div className="flex h-[56px] items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    player.id === currentPlayerId
                      ? "bg-[#8B5CF6]/12 text-[#8B5CF6]"
                      : "bg-white/8 text-[#8E8E93]"
                  } text-sm font-semibold`}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">
                  {player.name}
                  {player.id === currentPlayerId && (
                    <span className="ml-1 text-[#8B5CF6]">{t.players.you}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {player.isHost && (
                  <span className="rounded-full bg-[#8B5CF6]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#8B5CF6]">
                    <Crown className="mr-1 inline h-3 w-3" /> {t.players.host}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <p className="py-6 text-center text-sm text-[#48484A]">{t.players.waitingForPlayers}</p>
        )}
      </div>
    </div>
  );
});
