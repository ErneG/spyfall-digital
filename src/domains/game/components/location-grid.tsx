"use client";

import { MapPin } from "lucide-react";
import { memo, useState, useCallback, useMemo } from "react";

import { endGame } from "@/domains/game/actions";
import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import type { LocationInfo } from "@/domains/game/schema";


interface LocationGridProps {
  locations: LocationInfo[];
  revealedLocation: string | null;
  prevLocationName: string | null;
  gameId?: string;
  playerId?: string;
}

const LocationButton = memo(function LocationButton({
  location,
  isRevealed,
  isPrevious,
  isCrossed,
  isSpy,
  onSpyClick,
  onCrossClick,
}: {
  location: LocationInfo;
  isRevealed: boolean;
  isPrevious: boolean;
  isCrossed: boolean;
  isSpy: boolean;
  onSpyClick: (loc: LocationInfo) => void;
  onCrossClick: (locId: string) => void;
}) {
  const { translateLocation } = useTranslation();
  const handleClick = useCallback(() => {
    if (isSpy) {
      onSpyClick(location);
    } else {
      onCrossClick(location.id);
    }
  }, [isSpy, onSpyClick, onCrossClick, location]);

  let className = "text-left text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer ";
  if (isRevealed) {
    className += "bg-[#8B5CF6]/12 text-[#8B5CF6] font-bold";
  } else if (isPrevious) {
    className += "bg-[#1C1C1E] text-[#48484A] line-through opacity-50";
  } else if (isCrossed) {
    className += "bg-[#1C1C1E] text-[#48484A] line-through";
  } else if (isSpy) {
    className += "bg-[#1C1C1E] text-[#8E8E93] hover:bg-[#2C2C2E]";
  } else {
    className += "bg-[#1C1C1E] text-[#8E8E93] hover:bg-[#2C2C2E]";
  }

  return (
    <button onClick={handleClick} className={className}>
      {translateLocation(location.name)}
    </button>
  );
});

/* ── Guess confirmation dialog ────────────────────────── */

const GuessDialog = memo(function GuessDialog({
  guessTarget,
  isGuessing,
  onCancel,
  onConfirm,
}: {
  guessTarget: LocationInfo | null;
  isGuessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t, translateLocation } = useTranslation();
  return (
    <Dialog open={!!guessTarget} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.locationGrid.guessTitle}</DialogTitle>
          <DialogDescription>
            Are you sure the location is{" "}
            <strong>{guessTarget ? translateLocation(guessTarget.name) : ""}</strong>?
            {t.locationGrid.guessConfirm}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isGuessing}>
            {isGuessing ? t.locationGrid.guessing : t.locationGrid.confirmGuess}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

/* ── Main grid ────────────────────────────────────────── */

export const LocationGrid = memo(function LocationGrid({
  locations,
  revealedLocation,
  prevLocationName,
  gameId,
  playerId,
}: LocationGridProps) {
  const { t } = useTranslation();
  const [guessTarget, setGuessTarget] = useState<LocationInfo | null>(null);
  const [isGuessing, setIsGuessing] = useState(false);
  const [crossedOut, setCrossedOut] = useState<Set<string>>(new Set());
  const isSpy = !!gameId;

  const toggleCrossOut = useCallback((locId: string) => {
    setCrossedOut((previous) => {
      const next = new Set(previous);
      if (next.has(locId)) {
        next.delete(locId);
      } else {
        next.add(locId);
      }
      return next;
    });
  }, []);

  const handleGuess = useCallback(async () => {
    if (!gameId || !playerId || !guessTarget) {return;}
    setIsGuessing(true);
    try {
      await endGame({ gameId, playerId, spyGuessLocationId: guessTarget.id });
    } finally {
      setIsGuessing(false);
      setGuessTarget(null);
    }
  }, [gameId, playerId, guessTarget]);

  const handleCancelGuess = useCallback(() => {
    setGuessTarget(null);
  }, []);

  const handleConfirmGuess = useCallback(() => {
    void handleGuess();
  }, [handleGuess]);

  const locationButtons = useMemo(
    () =>
      locations.map((loc) => (
        <LocationButton
          key={loc.id}
          location={loc}
          isRevealed={revealedLocation === loc.name}
          isPrevious={prevLocationName === loc.name}
          isCrossed={crossedOut.has(loc.id)}
          isSpy={isSpy}
          onSpyClick={setGuessTarget}
          onCrossClick={toggleCrossOut}
        />
      )),
    [locations, revealedLocation, prevLocationName, crossedOut, isSpy, toggleCrossOut],
  );

  return (
    <>
      <div className="rounded-2xl bg-[#141414] p-4">
        <p className="mb-3 text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
          <MapPin className="mr-1 inline h-3 w-3" />
          {t.locationGrid.title} ({locations.length})
          {isSpy && <span className="ml-1 text-[#EF4444]">{t.locationGrid.tapToGuess}</span>}
        </p>
        <div className="grid grid-cols-2 gap-1.5">{locationButtons}</div>
      </div>

      <GuessDialog
        guessTarget={guessTarget}
        isGuessing={isGuessing}
        onCancel={handleCancelGuess}
        onConfirm={handleConfirmGuess}
      />
    </>
  );
});
