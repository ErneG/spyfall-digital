"use client";

import { PassAndPlayGameView } from "./pass-and-play-game-view";
import { usePassAndPlayRoomPage } from "./use-pass-and-play-room-page";

interface PassAndPlayRoomPageClientProps {
  code: string;
}

export function PassAndPlayRoomPageClient({ code }: PassAndPlayRoomPageClientProps) {
  const state = usePassAndPlayRoomPage(code);
  const { t, session, isLoaded } = state;

  if (!isLoaded || !session) {
    return null;
  }

  if (session.mode !== "pass-and-play") {
    return (
      <main className="flex min-h-dvh items-center justify-center p-4 text-sm text-slate-500">
        {t.common.loading}
      </main>
    );
  }

  return (
    <PassAndPlayGameView
      gameId={session.resume.gameId}
      hostPlayerId={session.playerId}
      roomId={session.roomId}
      allPlayers={session.resume.players}
      roomCode={code.toUpperCase()}
      timeLimit={session.resume.timeLimit}
      gameStartedAt={session.resume.gameStartedAt}
      shouldHideSpyCount={session.resume.hideSpyCount}
      spyCount={session.resume.spyCount}
      isTimerRunning={false}
    />
  );
}
