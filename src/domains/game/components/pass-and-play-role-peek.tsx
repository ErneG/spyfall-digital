"use client";

import { useState, useCallback } from "react";

import { fetchPlayerRole, type PeekRole } from "@/domains/game/hooks";

import { RolePeekPicker, RolePeekReveal } from "./pass-and-play-role-peek-parts";

import type { useTranslation } from "@/shared/i18n/context";

type Translations = ReturnType<typeof useTranslation>["t"];

// ─── Role Peek (orchestrator) ─────────────────────────────

interface RolePeekProps {
  gameId: string;
  allPlayers: Array<{ id: string; name: string }>;
  onBack: () => void;
  t: Translations;
}

export function RolePeek({ gameId, allPlayers, onBack, t }: RolePeekProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [role, setRole] = useState<PeekRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlayer = useCallback(
    async (playerId: string) => {
      setSelectedPlayer(playerId);
      setIsLoading(true);
      const fetched = await fetchPlayerRole(gameId, playerId);
      setRole(fetched);
      setIsLoading(false);
    },
    [gameId],
  );

  const handleDismiss = useCallback(() => {
    setSelectedPlayer(null);
    setRole(null);
    onBack();
  }, [onBack]);

  if (selectedPlayer && role) {
    const playerName = allPlayers.find((p) => p.id === selectedPlayer)?.name ?? "";
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <RolePeekReveal playerName={playerName} role={role} onDismiss={handleDismiss} t={t} />
        </div>
      </main>
    );
  }

  return (
    <RolePeekPicker
      allPlayers={allPlayers}
      isLoading={isLoading}
      onSelect={handleSelectPlayer}
      onBack={onBack}
      t={t}
    />
  );
}
