"use client";

import { RolePeekHandoff, RolePeekPicker, RolePeekReveal } from "./pass-and-play-role-peek-parts";
import { useRolePeek } from "./use-role-peek";

import type { useTranslation } from "@/shared/i18n/context";

type Translations = ReturnType<typeof useTranslation>["t"];

interface RolePeekProps {
  gameId: string;
  allPlayers: Array<{ id: string; name: string }>;
  onBack: () => void;
  t: Translations;
}

export function RolePeek({ gameId, allPlayers, onBack, t }: RolePeekProps) {
  const {
    step,
    selectedPlayerId,
    role,
    isLoading,
    hasFetchError,
    handleOpenPicker,
    handleSelectPlayer,
    handleDismissReveal,
    handleExit,
  } = useRolePeek(gameId, onBack);

  if (step === "reveal" && selectedPlayerId && role) {
    const playerName = allPlayers.find((player) => player.id === selectedPlayerId)?.name ?? "";

    return (
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#eef3f8] p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(255,255,255,0.58)_32%,transparent_54%),radial-gradient(circle_at_82%_18%,rgba(191,219,254,0.52),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.4),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
        <div className="relative w-full max-w-md space-y-4 text-center">
          <RolePeekReveal
            playerName={playerName}
            role={role}
            onDismiss={handleDismissReveal}
            t={t}
          />
        </div>
      </main>
    );
  }

  if (step === "handoff") {
    return <RolePeekHandoff onContinue={handleOpenPicker} onBack={handleExit} t={t} />;
  }

  return (
    <RolePeekPicker
      allPlayers={allPlayers}
      isLoading={isLoading}
      hasFetchError={hasFetchError}
      onSelect={handleSelectPlayer}
      onBack={handleExit}
      t={t}
    />
  );
}
