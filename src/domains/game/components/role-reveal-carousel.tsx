"use client";

import { useTranslation } from "@/shared/i18n/context";

import { AllReadyScreen, CardScreen, HandoffScreen } from "./role-reveal-parts";
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
            remaining={state.remaining}
            onReady={state.handleReady}
          />
        )}

        {state.step === "card" && (
          <CardScreen
            playerName={state.currentPlayer.name}
            role={state.role}
            isFlipped={state.isFlipped}
            isLoading={state.isLoading}
            hasFetchError={state.hasFetchError}
            isLast={state.isLast}
            remaining={state.remaining}
            onFlip={state.handleFlip}
            onNext={state.handleNext}
          />
        )}
      </div>
    </main>
  );
}
