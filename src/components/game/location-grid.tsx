"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import type { LocationInfo } from "@/types/game";

interface LocationGridProps {
  locations: LocationInfo[];
  revealedLocation: string | null;
  prevLocationName: string | null;
  gameId?: string;
  playerId?: string;
}

const LocationButton = memo(function LocationButton({
  name,
  isRevealed,
  isPrevious,
  isCrossed,
  isSpy,
  onClick,
}: {
  name: string;
  isRevealed: boolean;
  isPrevious: boolean;
  isCrossed: boolean;
  isSpy: boolean;
  onClick: () => void;
}) {
  let className = "text-left text-xs py-1.5 px-2 rounded transition-colors cursor-pointer ";
  if (isRevealed) {
    className += "bg-primary/10 text-primary font-bold";
  } else if (isPrevious) {
    className += "bg-muted/30 text-muted-foreground line-through opacity-50";
  } else if (isCrossed) {
    className += "bg-muted/30 text-muted-foreground line-through";
  } else if (isSpy) {
    className += "bg-muted/50 hover:bg-muted";
  } else {
    className += "bg-muted/50 hover:bg-muted/70";
  }

  return (
    <button onClick={onClick} className={className}>
      {name}
    </button>
  );
});

export const LocationGrid = memo(function LocationGrid({
  locations,
  revealedLocation,
  prevLocationName,
  gameId,
  playerId,
}: LocationGridProps) {
  const [guessTarget, setGuessTarget] = useState<LocationInfo | null>(null);
  const [guessing, setGuessing] = useState(false);
  const [crossedOut, setCrossedOut] = useState<Set<string>>(new Set());
  const isSpy = !!gameId;

  const toggleCrossOut = useCallback((locId: string) => {
    setCrossedOut((prev) => {
      const next = new Set(prev);
      if (next.has(locId)) {
        next.delete(locId);
      } else {
        next.add(locId);
      }
      return next;
    });
  }, []);

  const handleGuess = useCallback(async () => {
    if (!gameId || !playerId || !guessTarget) return;
    setGuessing(true);
    try {
      await fetch(`/api/games/${gameId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, spyGuessLocationId: guessTarget.id }),
      });
    } finally {
      setGuessing(false);
      setGuessTarget(null);
    }
  }, [gameId, playerId, guessTarget]);

  const locationButtons = useMemo(
    () =>
      locations.map((loc) => (
        <LocationButton
          key={loc.id}
          name={loc.name}
          isRevealed={revealedLocation === loc.name}
          isPrevious={prevLocationName === loc.name}
          isCrossed={crossedOut.has(loc.id)}
          isSpy={isSpy}
          onClick={
            isSpy
              ? () => setGuessTarget(loc)
              : () => toggleCrossOut(loc.id)
          }
        />
      )),
    [locations, revealedLocation, prevLocationName, crossedOut, isSpy, toggleCrossOut],
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Locations ({locations.length})
            {isSpy && <span className="text-destructive ml-1">&mdash; tap to guess!</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-1.5">{locationButtons}</div>
        </CardContent>
      </Card>

      <Dialog open={!!guessTarget} onOpenChange={() => setGuessTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guess the Location?</DialogTitle>
            <DialogDescription>
              Are you sure the location is <strong>{guessTarget?.name}</strong>?
              If you&apos;re wrong, you lose!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGuessTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleGuess()} disabled={guessing}>
              {guessing ? "Guessing..." : "Confirm Guess"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
