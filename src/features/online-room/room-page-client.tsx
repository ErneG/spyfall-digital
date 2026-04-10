"use client";

import { GameView } from "@/domains/game/components/game-view";
import { PassAndPlayGameView } from "@/features/pass-and-play/runtime/pass-and-play-game-view";

import { RoomLobby, RoomLoadingSpinner } from "./room-page-parts";
import { useRoomPage } from "./use-room-page";

interface RoomPageClientProps {
  code: string;
}

export function RoomPageClient({ code }: RoomPageClientProps) {
  const state = useRoomPage(code);
  const { t, session, isLoaded, room } = state;

  if (!isLoaded || !session) {
    return null;
  }

  if (session.mode === "pass-and-play") {
    return (
      <PassAndPlayGameView
        gameId={session.resume.gameId}
        hostPlayerId={session.playerId}
        roomId={session.roomId}
        allPlayers={session.resume.players}
        roomCode={code}
        timeLimit={session.resume.timeLimit}
        gameStartedAt={session.resume.gameStartedAt}
        shouldHideSpyCount={session.resume.hideSpyCount}
        spyCount={session.resume.spyCount}
        isTimerRunning={false}
      />
    );
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

  if (!room) {
    return <RoomLoadingSpinner label={t.common.loading} />;
  }

  return <RoomLobby code={code} state={state} />;
}
