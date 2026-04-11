"use client";

import { MapPin } from "lucide-react";
import { memo, useMemo } from "react";

import { useTranslation } from "@/shared/i18n/context";

import { GuessDialog, LocationButton } from "./location-grid-parts";
import { useLocationGrid } from "./use-location-grid";

import type { LocationInfo } from "./schema";

interface LocationGridProps {
  locations: LocationInfo[];
  revealedLocation: string | null;
  prevLocationName: string | null;
  gameId?: string;
  playerId?: string;
}

export const LocationGrid = memo(function LocationGrid({
  locations,
  revealedLocation,
  prevLocationName,
  gameId,
  playerId,
}: LocationGridProps) {
  const { t } = useTranslation();
  const grid = useLocationGrid({
    locations,
    revealedLocation,
    previousLocationName: prevLocationName,
    gameId,
    playerId,
  });

  const buttons = useMemo(
    () =>
      locations.map((location) => (
        <LocationButton
          key={location.id}
          location={location}
          isRevealed={revealedLocation === location.name}
          isPrevious={prevLocationName === location.name}
          isCrossed={grid.crossedOut.has(location.id)}
          isSpy={grid.isSpy}
          onSpyClick={grid.setGuessTarget}
          onCrossClick={grid.toggleCrossOut}
        />
      )),
    [
      grid.crossedOut,
      grid.isSpy,
      grid.setGuessTarget,
      grid.toggleCrossOut,
      locations,
      prevLocationName,
      revealedLocation,
    ],
  );

  return (
    <>
      <div className="bg-surface-1 rounded-2xl p-4">
        <p className="text-muted-foreground/60 mb-3 text-[11px] tracking-[0.08em] uppercase">
          <MapPin className="mr-1 inline h-3 w-3" />
          {t.locationGrid.title} ({locations.length})
        </p>
        <div className="grid grid-cols-2 gap-1.5">{buttons}</div>
      </div>

      <GuessDialog
        guessTarget={grid.guessTarget}
        isGuessing={grid.isGuessing}
        onCancel={grid.handleCancelGuess}
        onConfirm={grid.handleConfirmGuess}
      />
    </>
  );
});
