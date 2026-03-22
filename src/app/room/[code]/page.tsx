"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/hooks/use-session";
import { useRoomEvents } from "@/hooks/use-room-events";
import { GameView } from "@/components/game/game-view";
import { Copy, Check, Users, Crown, Wifi, WifiOff } from "lucide-react";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { session, clearSession } = useSession();
  const { data: room, connected } = useRoomEvents(code);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if no session
  useEffect(() => {
    if (!session || session.roomCode !== code.toUpperCase()) {
      router.push("/");
    }
  }, [session, code, router]);

  async function handleStart() {
    if (!session) return;
    setStarting(true);
    setError("");

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: session.roomId, playerId: session.playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start game");
    } finally {
      setStarting(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(code.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLeave() {
    clearSession();
    router.push("/");
  }

  if (!session) return null;

  // If game is active, show game view
  if (room && room.state !== "LOBBY" && room.currentGameId) {
    return (
      <GameView
        gameId={room.currentGameId}
        playerId={session.playerId}
        isHost={session.isHost}
        roomCode={code}
        timeLimit={room.timeLimit}
        gameStartedAt={room.gameStartedAt}
      />
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Room Code Header */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Room Code</p>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 text-4xl font-mono font-bold tracking-[0.3em] hover:text-primary transition-colors cursor-pointer"
          >
            {code.toUpperCase()}
            {copied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {connected ? (
              <><Wifi className="h-3 w-3 text-green-500" /> Connected</>
            ) : (
              <><WifiOff className="h-3 w-3 text-destructive" /> Reconnecting...</>
            )}
          </div>
        </div>

        {/* Players List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Players ({room?.players.length ?? 0}/12)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {room?.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium">
                    {player.name}
                    {player.id === session.playerId && (
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
              {(!room || room.players.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Waiting for players...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        {session.isHost ? (
          <div className="space-y-3">
            <Button
              className="w-full h-12 text-lg"
              onClick={handleStart}
              disabled={starting || !room || room.players.length < 3}
            >
              {starting ? "Starting..." : "Start Game"}
            </Button>
            {room && room.players.length < 3 && (
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

        <Separator />
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleLeave}>
          Leave Room
        </Button>
      </div>
    </main>
  );
}
