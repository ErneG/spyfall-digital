"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { GameView } from "@/domains/game/components/game-view";
import { getPassAndPlayRuntimeRoute } from "@/features/pass-and-play/routes";

import { RoomLobby, RoomLoadingSpinner } from "./room-page-parts";
import { useRoomPage } from "./use-room-page";

interface RoomPageClientProps {
  code: string;
}

export function RoomPageClient({ code }: RoomPageClientProps) {
  const router = useRouter();
  const state = useRoomPage(code);
  const { t, session, isLoaded, room } = state;

  useEffect(() => {
    if (session?.mode === "pass-and-play") {
      router.replace(getPassAndPlayRuntimeRoute(code));
    }
  }, [code, router, session]);

  if (!isLoaded || !session) {
    return null;
  }

  if (session.mode === "pass-and-play") {
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

  if (!room) {
    return <RoomLoadingSpinner label={t.common.loading} />;
  }

  return <RoomLobby code={code} state={state} />;
}
