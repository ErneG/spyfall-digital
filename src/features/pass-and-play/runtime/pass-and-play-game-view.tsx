"use client";

import { useTranslation } from "@/shared/i18n/context";

import { PhaseRouter } from "./pass-and-play-game-view-parts";
import { usePassAndPlay } from "./use-pass-and-play";

interface PassAndPlayGameViewProps {
  gameId: string;
  hostPlayerId: string;
  roomId: string;
  allPlayers: Array<{ id: string; name: string }>;
  roomCode: string;
  timeLimit: number;
  gameStartedAt: string | null;
  shouldHideSpyCount: boolean;
  spyCount: number;
  isTimerRunning: boolean;
}

export function PassAndPlayGameView(props: PassAndPlayGameViewProps) {
  const { gameId, hostPlayerId, allPlayers, shouldHideSpyCount, spyCount } = props;
  const { t } = useTranslation();
  const state = usePassAndPlay({
    gameId,
    hostPlayerId,
    roomId: props.roomId,
    timeLimit: props.timeLimit,
    gameStartedAt: props.gameStartedAt,
    isTimerRunning: props.isTimerRunning,
  });

  if (!state.game && !state.isLoading && state.phase !== "role-reveal") {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p className="text-destructive">Failed to load game</p>
      </main>
    );
  }

  return (
    <PhaseRouter
      state={state}
      hostPlayerId={hostPlayerId}
      allPlayers={allPlayers}
      shouldHideSpyCount={shouldHideSpyCount}
      spyCount={spyCount}
      t={t}
    />
  );
}
