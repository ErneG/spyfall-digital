"use client";

import { use } from "react";

import { GameView } from "@/domains/game/components/game-view";
import { PassAndPlayGameView } from "@/domains/game/components/pass-and-play-game-view";

import { RoomLobby, RoomLoadingSpinner } from "./room-page-parts";
import { useRoomPage } from "./use-room-page";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const state = useRoomPage(code);
  const { t, session, isLoaded, room } = state;

  if (!isLoaded || !session) {
    return null;
  }

  // Pass-and-play: render directly from session data, no SSE needed
  if (session.passAndPlay && session.allPlayers && session.gameId) {
    return (
      <PassAndPlayGameView
        gameId={session.gameId}
        hostPlayerId={session.playerId}
        roomId={session.roomId}
        allPlayers={session.allPlayers}
        roomCode={code}
        timeLimit={session.timeLimit ?? 480}
        gameStartedAt={session.gameStartedAt ?? null}
        shouldHideSpyCount={session.hideSpyCount ?? false}
        spyCount={session.spyCount ?? 1}
        isTimerRunning={false}
      />
    );
  }

  if (session.passAndPlay && !room) {
    return <RoomLoadingSpinner label={t.common.loading} />;
  }

  if (room && room.state !== "LOBBY" && room.currentGameId) {
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

  return <RoomLobby code={code} state={state} />;
}
