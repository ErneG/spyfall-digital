"use client";

import { useTranslation } from "@/shared/i18n/context";

import { AllReadyScreen, HandoffScreen, ReadyScreen, RevealedScreen } from "./role-reveal-parts";
import { useRoleReveal } from "./use-role-reveal";

export function RoleRevealCarousel({
  gameId,
  players,
  onComplete,
}: {
  gameId: string;
  players: Array<{ id: string; name: string }>;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const state = useRoleReveal(gameId, players);

  if (state.isAllDone) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AllReadyScreen onStart={onComplete} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-muted-foreground text-center text-sm">
          {t.passAndPlay.playerNofM} {state.playerIndex + 1} of {players.length}
        </div>

        {state.step === "handoff" && (
          <HandoffScreen
            playerName={state.currentPlayer.name}
            isFirst={state.playerIndex === 0}
            onReady={state.handleReady}
          />
        )}

        {state.step === "ready" && (
          <ReadyScreen
            playerName={state.currentPlayer.name}
            isLoading={state.isLoading}
            hasError={state.hasFetchError}
            onReveal={state.handleRevealClick}
          />
        )}

        {state.step === "revealed" && state.role && (
          <RevealedScreen role={state.role} isLast={state.isLast} onNext={state.handleNext} />
        )}
      </div>
    </main>
  );
}
