"use client";

import { useEffect, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer } from "@/components/game/timer";
import { VotePanel } from "@/components/game/vote-panel";
import { Eye, EyeOff, MapPin, Shield, AlertTriangle, Pause, Play } from "lucide-react";
import type { GameView as GameViewData, PlayerInfo } from "@/types/game";

const BEEP_FREQUENCY = 800;
const BEEP_VOLUME = 0.3;
const BEEP_GAP = 0.3;
const BEEP_DURATION = 0.15;
const BEEP_COUNT = 2;

/* ── Sub-components ───────────────────────────────────── */

export const RoleCard = memo(function RoleCard({
  isSpy, isRoleRevealed, location, myRole, onToggle,
}: {
  isSpy: boolean; isRoleRevealed: boolean; location: string | null; myRole: string | null; onToggle: () => void;
}) {
  return (
    <Card className={isSpy ? "border-destructive/50 bg-destructive/5" : ""}>
      <CardContent className="pt-6 text-center space-y-3">
        <button onClick={onToggle} className="w-full cursor-pointer">
          {isRoleRevealed ? (
            <>
              {isSpy ? (
                <div className="space-y-2">
                  <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
                  <p className="text-2xl font-bold text-destructive">You are the SPY</p>
                  <p className="text-sm text-muted-foreground">
                    Figure out the location from other players&apos; questions!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Shield className="h-8 w-8 mx-auto text-primary" />
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-bold">{location}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your role: <span className="font-semibold text-foreground">{myRole}</span>
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <EyeOff className="h-3 w-3" /> Tap to hide
              </p>
            </>
          ) : (
            <div className="space-y-2 py-4">
              <Eye className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Tap to reveal your role</p>
            </div>
          )}
        </button>
      </CardContent>
    </Card>
  );
});

export const PlayerList = memo(function PlayerList({
  players, currentPlayerId,
}: {
  players: PlayerInfo[]; currentPlayerId: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <p className="text-xs text-muted-foreground mb-2">Players ({players.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {players.map((p) => (
            <Badge key={p.id} variant={p.id === currentPlayerId ? "default" : "secondary"}>
              {p.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export const TimerSection = memo(function TimerSection({
  display, isExpired, isTimerRunning, isHost, onToggle,
}: {
  display: string; isExpired: boolean; isTimerRunning: boolean; isHost: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Timer display={display} isExpired={isExpired} isPaused={!isTimerRunning} />
      </div>
      {isHost && (
        <Button variant="outline" size="icon" className="h-12 w-12 shrink-0" onClick={onToggle}>
          {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
      )}
    </div>
  );
});

export const GameActions = memo(function GameActions({
  isHost, isEnding, onEndGame, game, playerId, gameId,
}: {
  isHost: boolean; isEnding: boolean; onEndGame: () => void; game: GameViewData; playerId: string; gameId: string;
}) {
  return (
    <div className="flex gap-2">
      {isHost && (
        <Button variant="destructive" className="flex-1" onClick={onEndGame} disabled={isEnding}>
          {isEnding ? "Ending..." : "End Game"}
        </Button>
      )}
      <VotePanel players={game.players} playerId={playerId} gameId={gameId} />
    </div>
  );
});

/* ── Hooks ────────────────────────────────────────────── */

export function useExpiryBeep(isExpired: boolean) {
  const hasBeeped = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isExpired && !hasBeeped.current) {
      hasBeeped.current = true;
      try {
        audioCtxRef.current ??= new AudioContext();
        const ctx = audioCtxRef.current;
        for (let i = 0; i < BEEP_COUNT; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = BEEP_FREQUENCY;
          gain.gain.value = BEEP_VOLUME;
          osc.start(ctx.currentTime + i * BEEP_GAP);
          osc.stop(ctx.currentTime + i * BEEP_GAP + BEEP_DURATION);
        }
      } catch {
        // Audio not available
      }
    }
  }, [isExpired]);
}

export function useGameActions(gameId: string, playerId: string) {
  const handleTimerToggle = useCallback(async (isTimerRunning: boolean) => {
    await fetch(`/api/games/${gameId}/timer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, action: isTimerRunning ? "pause" : "resume" }),
    });
  }, [gameId, playerId]);

  const handleEndGame = useCallback(async () => {
    await fetch(`/api/games/${gameId}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  }, [gameId, playerId]);

  const handleRestart = useCallback(async () => {
    await fetch(`/api/games/${gameId}/restart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  }, [gameId, playerId]);

  return { handleTimerToggle, handleEndGame, handleRestart };
}
