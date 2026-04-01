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

  if (session.passAndPlay && session.allPlayers && !room) {
    return <RoomLoadingSpinner label={t.common.loading} />;
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
          shouldHideSpyCount={room.hideSpyCount}
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

  return <RoomLobby code={code} state={state} />;
}
