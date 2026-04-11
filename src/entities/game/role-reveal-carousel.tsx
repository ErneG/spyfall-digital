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
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#eef3f8] p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(255,255,255,0.58)_32%,transparent_54%),radial-gradient(circle_at_82%_18%,rgba(191,219,254,0.52),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.4),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
        <div className="w-full max-w-md">
          <AllReadyScreen onStart={onComplete} />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#eef3f8] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(255,255,255,0.58)_32%,transparent_54%),radial-gradient(circle_at_82%_18%,rgba(191,219,254,0.52),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.4),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative w-full max-w-md space-y-4">
        <div className="text-center text-sm text-slate-500">
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
