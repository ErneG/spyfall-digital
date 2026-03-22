"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, AlertTriangle, Trophy, RotateCcw, LogOut } from "lucide-react";
import type { GameView, PlayerInfo } from "@/types/game";

interface RevealScreenProps {
  game: GameView & {
    spies?: string[];
    revealedLocation?: string;
  };
  playerId: string;
  isHost: boolean;
  onRestart: () => void;
  onLeave: () => void;
}

export function RevealScreen({ game, playerId, isHost, onRestart, onLeave }: RevealScreenProps) {
  const spyIds = game.spies ?? [];
  const location = game.revealedLocation ?? game.location ?? "Unknown";

  const spyNames = game.players
    .filter((p: PlayerInfo) => spyIds.includes(p.id))
    .map((p: PlayerInfo) => p.name);

  const wasSpy = spyIds.includes(playerId);

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Result Header */}
        <div className="space-y-3">
          <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
          <h1 className="text-3xl font-bold">Game Over!</h1>
        </div>

        {/* Location Reveal */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" /> The location was
              </p>
              <p className="text-2xl font-bold">{location}</p>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {spyNames.length === 1 ? "The spy was" : "The spies were"}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {spyNames.map((name) => (
                  <Badge key={name} variant="destructive" className="text-base px-3 py-1">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>

            {wasSpy && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  You were the spy! Your role: <span className="font-semibold text-foreground">{game.myRole}</span>
                </p>
              </>
            )}

            {!wasSpy && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Your role was: <span className="font-semibold text-foreground">{game.myRole}</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* All Players and Their Roles */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {game.players.map((p: PlayerInfo) => {
                const isSpy = spyIds.includes(p.id);
                return (
                  <div key={p.id} className="flex items-center justify-between py-1.5 px-3 rounded bg-muted/50">
                    <span className="font-medium">{p.name}</span>
                    {isSpy && <Badge variant="destructive">Spy</Badge>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          {isHost && (
            <Button className="w-full h-12 text-lg gap-2" onClick={onRestart}>
              <RotateCcw className="h-5 w-5" />
              Play Again
            </Button>
          )}
          {!isHost && (
            <p className="text-sm text-muted-foreground">
              Waiting for the host to start a new round...
            </p>
          )}
          <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={onLeave}>
            <LogOut className="h-4 w-4" />
            Leave Room
          </Button>
        </div>
      </div>
    </main>
  );
}
