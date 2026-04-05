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
    <div className="bg-surface-1 rounded-2xl">
      <div className="px-4 pt-4 pb-2">
        <p className="text-muted-foreground/60 text-[11px] tracking-[0.08em] uppercase">
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
                      ? "bg-spy-purple/12 text-spy-purple"
                      : "text-muted-foreground bg-white/8"
                  } text-sm font-semibold`}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">
                  {player.name}
                  {player.id === currentPlayerId && (
                    <span className="text-spy-purple ml-1">{t.players.you}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {player.isHost && (
                  <span className="bg-spy-purple/12 text-spy-purple rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                    <Crown className="mr-1 inline h-3 w-3" /> {t.players.host}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <p className="text-muted-foreground/60 py-6 text-center text-sm">
            {t.players.waitingForPlayers}
          </p>
        )}
      </div>
    </div>
  );
});
