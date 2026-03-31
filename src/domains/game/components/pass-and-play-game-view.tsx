"use client";

import { SpyGuessPhase, VotingPhase } from "@/domains/game/components/pass-and-play-phases";
import { PlayingPhase } from "@/domains/game/components/pass-and-play-playing";
import { RevealScreen } from "@/domains/game/components/reveal-screen";
import { RoleRevealCarousel } from "@/domains/game/components/role-reveal-carousel";
import { usePassAndPlay } from "@/domains/game/components/use-pass-and-play";
import { useTranslation } from "@/shared/i18n/context";

interface PassAndPlayGameViewProps {
  gameId: string;
  hostPlayerId: string;
  allPlayers: Array<{ id: string; name: string }>;
  roomCode: string;
  timeLimit: number;
  gameStartedAt: string | null;
  hideSpyCount: boolean;
  spyCount: number;
  isTimerRunning: boolean;
}

export function PassAndPlayGameView(props: PassAndPlayGameViewProps) {
  const { gameId, hostPlayerId, allPlayers, hideSpyCount, spyCount } = props;
  const { t } = useTranslation();
  const state = usePassAndPlay({
    gameId,
    hostPlayerId,
    allPlayers,
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
      gameId={gameId}
      hostPlayerId={hostPlayerId}
      allPlayers={allPlayers}
      hideSpyCount={hideSpyCount}
      spyCount={spyCount}
      t={t}
    />
  );
}

// ─── Phase router ──────────────────────────────────────────

interface PhaseRouterProps {
  state: ReturnType<typeof usePassAndPlay>;
  gameId: string;
  hostPlayerId: string;
  allPlayers: Array<{ id: string; name: string }>;
  hideSpyCount: boolean;
  spyCount: number;
  t: ReturnType<typeof useTranslation>["t"];
}

function PhaseRouter({
  state,
  gameId,
  hostPlayerId,
  allPlayers,
  hideSpyCount,
  spyCount,
  t,
}: PhaseRouterProps) {
  const { game, phase, shouldShowReveal } = state;

  if (phase === "role-reveal") {
    return (
      <RoleRevealCarousel
        gameId={gameId}
        players={allPlayers}
        onComplete={state.handleRoleRevealComplete}
      />
    );
  }

  if (shouldShowReveal && game) {
    return (
      <RevealScreen
        game={game}
        playerId={hostPlayerId}
        isHost
        onRestart={state.handlePlayAgain}
        onLeave={state.handleLeave}
      />
    );
  }

  if (phase === "spy-guess") {
    return (
      <SpyGuessPhase
        spyGuess={state.spyGuess}
        game={game}
        allPlayers={allPlayers}
        gameId={gameId}
        t={t}
      />
    );
  }

  if (phase === "voting") {
    return <VotingPhase voting={state.voting} allPlayers={allPlayers} t={t} />;
  }

  return (
    <PlayingPhase
      state={state}
      allPlayers={allPlayers}
      hideSpyCount={hideSpyCount}
      spyCount={spyCount}
      t={t}
    />
  );
}
