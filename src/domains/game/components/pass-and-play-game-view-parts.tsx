"use client";

import { SpyGuessPhase, VotingPhase } from "@/domains/game/components/pass-and-play-phases";
import { PlayingPhase } from "@/domains/game/components/pass-and-play-playing";
import { RevealScreen } from "@/domains/game/components/reveal-screen";
import { RoleRevealCarousel } from "@/domains/game/components/role-reveal-carousel";

import type { usePassAndPlay } from "@/domains/game/components/use-pass-and-play";
import type { useTranslation } from "@/shared/i18n/context";

// ─── Phase router ──────────────────────────────────────────

interface PhaseRouterProps {
  state: ReturnType<typeof usePassAndPlay>;
  gameId: string;
  hostPlayerId: string;
  allPlayers: Array<{ id: string; name: string }>;
  shouldHideSpyCount: boolean;
  spyCount: number;
  t: ReturnType<typeof useTranslation>["t"];
}

export function PhaseRouter({
  state,
  gameId,
  hostPlayerId,
  allPlayers,
  shouldHideSpyCount,
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
      shouldHideSpyCount={shouldHideSpyCount}
      spyCount={spyCount}
      t={t}
    />
  );
}
