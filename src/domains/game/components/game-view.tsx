"use client";

import { GamePlayingView, GameWaitingView } from "@/domains/game/components/game-view-sections";
import { RevealScreen } from "@/domains/game/components/reveal-screen";
import { useGameView } from "@/domains/game/components/use-game-view";

const REVEAL_PHASES = new Set(["REVEAL", "FINISHED"]);

interface GameViewProps {
  gameId: string;
  playerId: string;
  isHost: boolean;
  roomCode: string;
  timeLimit: number;
  gameStartedAt: string | null;
  hideSpyCount: boolean;
  spyCount: number;
  isTimerRunning: boolean;
  players?: Array<{ id: string; name: string; isHost: boolean; isOnline: boolean }>;
}

export function GameView(props: GameViewProps) {
  const { gameId, playerId, isHost } = props;
  const state = useGameView(props);

  if (!state.game) {
    if (state.isLoading) {
      return (
        <main className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{state.t.common.loading}</p>
        </main>
      );
    }
    return (
      <GameWaitingView
        gameInProgressLabel={state.t.game.gameInProgress}
        waitingForRoundLabel={state.t.game.waitingForRound}
        leaveLabel={state.t.room.leaveRoom}
        players={state.roomPlayers}
        currentPlayerId={playerId}
        onLeave={state.handleLeave}
      />
    );
  }

  if (REVEAL_PHASES.has(state.game.phase)) {
    return (
      <RevealScreen
        game={state.game}
        playerId={playerId}
        isHost={isHost}
        onRestart={state.onRestart}
        onLeave={state.handleLeave}
      />
    );
  }

  return (
    <GamePlayingView
      display={state.display}
      isExpired={state.isExpired}
      isTimerRunning={state.isTimerRunning}
      isHost={isHost}
      isRoleRevealed={state.isRoleRevealed}
      isEnding={state.endMutation.isPending}
      spyCountLabel={state.spyCountLabel}
      game={state.game}
      gameId={gameId}
      playerId={playerId}
      onTimerToggle={state.onTimerToggle}
      toggleRole={state.toggleRole}
      onEndGame={state.onEndGameClick}
    />
  );
}
