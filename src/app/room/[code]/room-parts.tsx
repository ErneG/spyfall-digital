"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Users, Crown, Wifi, WifiOff } from "lucide-react";
import type { PlayerInfo } from "@/types/game";

/* ------------------------------------------------------------------ */
/*  RoomCodeHeader                                                     */
/* ------------------------------------------------------------------ */

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
  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-muted-foreground">Room Code</p>
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
            <Wifi className="h-3 w-3 text-green-500" /> Connected
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-destructive" /> Reconnecting...
          </>
        )}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  PlayerList                                                         */
/* ------------------------------------------------------------------ */

interface PlayerListProps {
  players: PlayerInfo[];
  currentPlayerId: string;
}

export const PlayerList = React.memo(function PlayerList({
  players,
  currentPlayerId,
}: PlayerListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Players ({players.length}/12)
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
                  <span className="text-muted-foreground ml-1">(you)</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {player.isHost && (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="h-3 w-3" /> Host
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Waiting for players...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

/* ------------------------------------------------------------------ */
/*  StartSection                                                       */
/* ------------------------------------------------------------------ */

interface StartSectionProps {
  isHost: boolean;
  isStarting: boolean;
  playerCount: number;
  error: string;
  onStart: () => void;
}

export const StartSection = React.memo(function StartSection({
  isHost,
  isStarting,
  playerCount,
  error,
  onStart,
}: StartSectionProps) {
  return (
    <>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      {isHost ? (
        <div className="space-y-2">
          <Button
            className="w-full h-12 text-lg"
            onClick={onStart}
            disabled={isStarting || playerCount < 3}
          >
            {isStarting ? "Starting..." : "Start Game"}
          </Button>
          {playerCount < 3 && (
            <p className="text-xs text-muted-foreground text-center">
              Need at least 3 players to start
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Waiting for the host to start the game...
        </p>
      )}
    </>
  );
});
