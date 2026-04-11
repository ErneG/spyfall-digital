"use client";

import { GameView } from "@/entities/game/view";

import { RoomLoadingSpinner } from "../room-page-parts";

import { useOnlineRoomRuntime } from "./use-online-room-runtime";

interface OnlineRoomRuntimePageClientProps {
  code: string;
}

export function OnlineRoomRuntimePageClient({ code }: OnlineRoomRuntimePageClientProps) {
  const state = useOnlineRoomRuntime(code);
  const { room, session, isLoaded, t } = state;

  if (!isLoaded || !session) {
    return null;
  }

  if (session.mode !== "online" || !room || room.state === "LOBBY" || !room.currentGameId) {
    return <RoomLoadingSpinner label={t.common.loading} />;
  }

  return (
    <GameView
      gameId={room.currentGameId}
      playerId={session.playerId}
      isHost={session.isHost}
      roomCode={code.toUpperCase()}
      timeLimit={room.timeLimit}
      gameStartedAt={room.gameStartedAt}
      hideSpyCount={room.hideSpyCount}
      spyCount={room.spyCount}
      isTimerRunning={room.timerRunning}
      players={room.players}
    />
  );
}
