"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Users, Crown } from "lucide-react";
import type { PlayerInfo } from "@/domains/room/schema";
import { useTranslation } from "@/shared/i18n/context";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          {t.players.title} ({players.length}/12)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
            >
              <span className="font-medium">
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="text-muted-foreground ml-1">{t.players.you}</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {player.isHost && (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="h-3 w-3" /> {t.players.host}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.players.waitingForPlayers}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
