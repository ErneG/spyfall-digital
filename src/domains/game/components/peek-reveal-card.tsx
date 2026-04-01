"use client";

import { memo } from "react";

import { PeekHidden, PeekShown } from "./peek-reveal-card-parts";

import type { PeekRole } from "@/domains/game/hooks";

export const PeekRevealCard = memo(function PeekRevealCard({
  playerName,
  role,
  isRevealed,
  isLoading,
  hasError,
  onReveal,
  onHide,
  onBack,
}: {
  playerName: string;
  role: PeekRole | null;
  isRevealed: boolean;
  isLoading: boolean;
  hasError?: boolean;
  onReveal: () => void;
  onHide: () => void;
  onBack: () => void;
}) {
  if (!isRevealed || !role) {
    return (
      <PeekHidden
        playerName={playerName}
        isLoading={isLoading}
        hasError={hasError}
        onReveal={onReveal}
        onBack={onBack}
      />
    );
  }

  return <PeekShown role={role} onHide={onHide} />;
});
