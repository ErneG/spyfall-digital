"use client";

import { PlayingPhase } from "@/domains/game/components/pass-and-play-playing";
import { RevealScreen } from "@/domains/game/components/reveal-screen";
import { RoleRevealCarousel } from "@/domains/game/components/role-reveal-carousel";

import type { usePassAndPlay } from "@/domains/game/components/use-pass-and-play";
import type { useTranslation } from "@/shared/i18n/context";

// ─── Phase router ──────────────────────────────────────────

interface PhaseRouterProps {
  state: ReturnType<typeof usePassAndPlay>;
  hostPlayerId: string;
  allPlayers: Array<{ id: string; name: string }>;
  shouldHideSpyCount: boolean;
  spyCount: number;
  t: ReturnType<typeof useTranslation>["t"];
}

export function PhaseRouter({
  state,
  hostPlayerId,
  allPlayers,
  shouldHideSpyCount,
  spyCount,
  t,
}: PhaseRouterProps) {
  const { game, phase, shouldShowReveal, activeGameId } = state;

  if (phase === "role-reveal") {
    return (
      <RoleRevealCarousel
        gameId={activeGameId}
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
        passAndPlay
        isRestarting={state.playAgainMutation.isPending}
        onRestart={state.handlePlayAgain}
        onLeave={state.handleLeave}
      />
    );
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
