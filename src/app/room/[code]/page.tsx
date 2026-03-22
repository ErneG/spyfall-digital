"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/hooks/use-session";
import { useRoomEvents } from "@/hooks/use-room-events";
import { GameConfig } from "@/components/lobby/game-config";
import { LocationSettings } from "@/components/lobby/location-settings";
import { GameView } from "@/components/game/game-view";
import { RoomCodeHeader, PlayerList, StartSection } from "./room-parts";

interface StartGameResponse { error?: string }

async function startGame(roomId: string, playerId: string): Promise<string | null> {
  const res = await fetch("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, playerId }),
  });
  const data = (await res.json()) as StartGameResponse;
  if (!res.ok) return data.error ?? "Failed to start game";
  return null;
}

const EMPTY_PLAYERS: never[] = [];

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { session, clearSession, isLoaded } = useSession();
  const { data: room, isConnected } = useRoomEvents(code);
  const [isCopied, setIsCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoaded && (!session || session.roomCode !== code.toUpperCase())) {
      router.push("/");
    }
  }, [isLoaded, session, code, router]);

  const handleStart = useCallback(async () => {
    if (!session) return;
    setIsStarting(true);
    setError("");
    const errorMessage = await startGame(session.roomId, session.playerId);
    if (errorMessage) setError(errorMessage);
    setIsStarting(false);
  }, [session]);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code.toUpperCase());
    setIsCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
  }, [code]);

  const handleLeave = useCallback(() => { clearSession(); router.push("/"); }, [clearSession, router]);
  const handleOpenLocations = useCallback(() => setIsLocationsOpen(true), []);
  const handleStartClick = useCallback(() => { void handleStart(); }, [handleStart]);

  if (!isLoaded || !session) return null;

  if (room && room.state !== "LOBBY" && room.currentGameId) {
    return (
      <GameView
        gameId={room.currentGameId} playerId={session.playerId} isHost={session.isHost}
        roomCode={code} timeLimit={room.timeLimit} gameStartedAt={room.gameStartedAt}
        hideSpyCount={room.hideSpyCount} spyCount={room.spyCount} isTimerRunning={room.timerRunning}
      />
    );
  }

  const players = room?.players ?? EMPTY_PLAYERS;

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <RoomCodeHeader code={code} isCopied={isCopied} isConnected={isConnected} onCopy={handleCopy} />
        {room && (
          <GameConfig
            roomCode={code} playerId={session.playerId} isHost={session.isHost}
            timeLimit={room.timeLimit} spyCount={room.spyCount} autoStartTimer={room.autoStartTimer}
            hideSpyCount={room.hideSpyCount} moderatorMode={room.moderatorMode}
            selectedLocationCount={room.selectedLocationCount} totalLocationCount={room.totalLocationCount}
            onOpenLocations={handleOpenLocations}
          />
        )}
        <LocationSettings open={isLocationsOpen} onOpenChange={setIsLocationsOpen} roomCode={code} playerId={session.playerId} />
        <PlayerList players={players} currentPlayerId={session.playerId} />
        <StartSection isHost={session.isHost} isStarting={isStarting} playerCount={players.length} error={error} onStart={handleStartClick} />
        <Separator />
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleLeave}>Leave Room</Button>
      </div>
    </main>
  );
}
