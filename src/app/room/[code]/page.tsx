"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, useCallback, useRef } from "react";

import { startGame } from "@/domains/game/actions";
import { GameView } from "@/domains/game/components/game-view";
import { PassAndPlayGameView } from "@/domains/game/components/pass-and-play-game-view";
import { LocationSettings } from "@/domains/location/components/location-settings";
import { GameConfig, RoomCodeHeader, PlayerList, StartSection } from "@/domains/room/components";
import { useRoomEvents } from "@/domains/room/hooks";
import { useSession } from "@/shared/hooks/use-session";
import { useTranslation } from "@/shared/i18n/context";
import { unwrapAction } from "@/shared/lib/unwrap-action";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

const EMPTY_PLAYERS: never[] = [];

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const { session, clearSession, isLoaded } = useSession();
  const { data: room, isConnected } = useRoomEvents(code);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoStartRef = useRef(false);

  const startGameMutation = useMutation({
    mutationFn: ({ roomId, playerId }: { roomId: string; playerId: string }) =>
      startGame({ roomId, playerId }).then(unwrapAction),
    onError: (caughtError) => setError(caughtError.message),
  });

  useEffect(() => {
    if (isLoaded && (!session || session.roomCode !== code.toUpperCase())) {
      router.push("/");
    }
  }, [isLoaded, session, code, router]);

  // Auto-start new game for pass-and-play when room returns to LOBBY (after "Play Again")
  useEffect(() => {
    if (!session?.passAndPlay || !room || room.state !== "LOBBY" || autoStartRef.current) {
      return;
    }
    autoStartRef.current = true;
    startGameMutation.mutate(
      { roomId: session.roomId, playerId: session.playerId },
      {
        onSettled: () => {
          autoStartRef.current = false;
        },
      },
    );
  }, [session, room, startGameMutation]);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code.toUpperCase());
    setIsCopied(true);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
  }, [code]);

  const handleLeave = useCallback(() => {
    clearSession();
    router.push("/");
  }, [clearSession, router]);
  const handleOpenLocations = useCallback(() => setIsLocationsOpen(true), []);
  const handleStartClick = useCallback(() => {
    if (!session) {
      return;
    }
    setError("");
    startGameMutation.mutate({ roomId: session.roomId, playerId: session.playerId });
  }, [session, startGameMutation]);

  if (!isLoaded || !session) {
    return null;
  }

  // Pass-and-play: show spinner only while SSE hasn't connected yet (room is null).
  // Once SSE delivers data, fall through to game view or auto-start.
  if (session.passAndPlay && session.allPlayers && !room) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="space-y-3 text-center">
          <div className="border-muted border-t-primary mx-auto h-8 w-8 animate-spin rounded-full border-4" />
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </main>
    );
  }

  if (room && room.state !== "LOBBY" && room.currentGameId) {
    if (session.passAndPlay && session.allPlayers) {
      return (
        <PassAndPlayGameView
          gameId={room.currentGameId}
          hostPlayerId={session.playerId}
          allPlayers={session.allPlayers}
          roomCode={code}
          timeLimit={room.timeLimit}
          gameStartedAt={room.gameStartedAt}
          hideSpyCount={room.hideSpyCount}
          spyCount={room.spyCount}
          isTimerRunning={room.timerRunning}
        />
      );
    }
    return (
      <GameView
        gameId={room.currentGameId}
        playerId={session.playerId}
        isHost={session.isHost}
        roomCode={code}
        timeLimit={room.timeLimit}
        gameStartedAt={room.gameStartedAt}
        hideSpyCount={room.hideSpyCount}
        spyCount={room.spyCount}
        isTimerRunning={room.timerRunning}
        players={room.players}
      />
    );
  }

  const players = room?.players ?? EMPTY_PLAYERS;

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <RoomCodeHeader
          code={code}
          isCopied={isCopied}
          isConnected={isConnected}
          onCopy={handleCopy}
        />
        {room && (
          <GameConfig
            roomCode={code}
            playerId={session.playerId}
            isHost={session.isHost}
            timeLimit={room.timeLimit}
            spyCount={room.spyCount}
            autoStartTimer={room.autoStartTimer}
            hideSpyCount={room.hideSpyCount}
            moderatorMode={room.moderatorMode}
            selectedLocationCount={room.selectedLocationCount}
            totalLocationCount={room.totalLocationCount}
            onOpenLocations={handleOpenLocations}
          />
        )}
        <LocationSettings
          open={isLocationsOpen}
          onOpenChange={setIsLocationsOpen}
          roomCode={code}
          playerId={session.playerId}
        />
        <PlayerList players={players} currentPlayerId={session.playerId} />
        <StartSection
          isHost={session.isHost}
          isStarting={startGameMutation.isPending}
          playerCount={players.length}
          error={error}
          onStart={handleStartClick}
        />
        <Separator />
        <Button variant="ghost" className="text-muted-foreground w-full" onClick={handleLeave}>
          {t.room.leaveRoom}
        </Button>
      </div>
    </main>
  );
}
