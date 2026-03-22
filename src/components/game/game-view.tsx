"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGameState } from "@/hooks/use-game-state";
import { useTimer } from "@/hooks/use-timer";
import { useSession } from "@/hooks/use-session";
import { Timer } from "@/components/game/timer";
import { LocationGrid } from "@/components/game/location-grid";
import { VotePanel } from "@/components/game/vote-panel";
import { RevealScreen } from "@/components/game/reveal-screen";
import { Eye, EyeOff, MapPin, Shield, AlertTriangle, Pause, Play } from "lucide-react";

interface GameViewProps {
  gameId: string;
  playerId: string;
  isHost: boolean;
  roomCode: string;
  timeLimit: number;
  gameStartedAt: string | null;
  hideSpyCount: boolean;
  spyCount: number;
  timerRunning: boolean;
}

export function GameView({
  gameId,
  playerId,
  isHost,
  roomCode,
  timeLimit,
  gameStartedAt,
  hideSpyCount,
  spyCount,
  timerRunning: initialTimerRunning,
}: GameViewProps) {
  const router = useRouter();
  const { clearSession } = useSession();
  const { game, loading } = useGameState(gameId, playerId);
  const timerRunning = game?.timerRunning ?? initialTimerRunning;
  const { display, expired } = useTimer(
    game?.startedAt ?? gameStartedAt,
    game?.timeLimit ?? timeLimit,
    timerRunning,
  );
  const [roleRevealed, setRoleRevealed] = useState(false);
  const [ending, setEnding] = useState(false);
  const beeped = useRef(false);

  // Beep on timer expiry
  useEffect(() => {
    if (expired && !beeped.current) {
      beeped.current = true;
      try {
        const ctx = new AudioContext();
        for (let i = 0; i < 2; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 800;
          gain.gain.value = 0.3;
          osc.start(ctx.currentTime + i * 0.3);
          osc.stop(ctx.currentTime + i * 0.3 + 0.15);
        }
      } catch {
        // Audio not available
      }
    }
  }, [expired]);

  async function handleTimerToggle() {
    await fetch(`/api/games/${gameId}/timer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, action: timerRunning ? "pause" : "resume" }),
    });
  }

  async function handleEndGame() {
    setEnding(true);
    try {
      await fetch(`/api/games/${gameId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
    } finally {
      setEnding(false);
    }
  }

  async function handleRestart() {
    await fetch(`/api/games/${gameId}/restart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  }

  function handleLeave() {
    clearSession();
    router.push("/");
  }

  if (loading && !game) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p className="text-muted-foreground">Loading game...</p>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p className="text-destructive">Failed to load game</p>
      </main>
    );
  }

  // Reveal screen
  if (game.phase === "REVEAL" || game.phase === "FINISHED") {
    return (
      <RevealScreen
        game={game}
        playerId={playerId}
        isHost={isHost}
        onRestart={() => void handleRestart()}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center p-4 pb-24">
      <div className="w-full max-w-md space-y-4">
        {/* Timer + Spy Count */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Timer display={display} expired={expired} paused={!timerRunning} />
          </div>
          {isHost && (
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={() => void handleTimerToggle()}
            >
              {timerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          )}
        </div>

        {/* Spy count indicator */}
        {!hideSpyCount && (
          <div className="flex justify-center gap-1">
            {Array.from({ length: spyCount }).map((_, i) => (
              <Badge key={i} variant="destructive" className="text-xs">
                <AlertTriangle className="mr-1 h-3 w-3" /> Spy
              </Badge>
            ))}
          </div>
        )}

        {/* Role Card */}
        <Card className={game.isSpy ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardContent className="pt-6 text-center space-y-3">
            <button
              onClick={() => setRoleRevealed(!roleRevealed)}
              className="w-full cursor-pointer"
            >
              {roleRevealed ? (
                <>
                  {game.isSpy ? (
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
                        <p className="text-lg font-bold">{game.location}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your role: <span className="font-semibold text-foreground">{game.myRole}</span>
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

        {/* Players */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-2">
              Players ({game.players.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {game.players.map((p) => (
                <Badge key={p.id} variant={p.id === playerId ? "default" : "secondary"}>
                  {p.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Grid with cross-out + previous */}
        <LocationGrid
          locations={game.allLocations}
          revealedLocation={game.isSpy ? null : game.location}
          prevLocationName={game.prevLocationName}
          gameId={game.isSpy ? gameId : undefined}
          playerId={game.isSpy ? playerId : undefined}
        />

        {/* Actions */}
        <Separator />
        <div className="flex gap-2">
          {isHost && (
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => void handleEndGame()}
              disabled={ending}
            >
              {ending ? "Ending..." : "End Game"}
            </Button>
          )}
          <VotePanel
            players={game.players}
            playerId={playerId}
            gameId={gameId}
          />
        </div>
      </div>
    </main>
  );
}
