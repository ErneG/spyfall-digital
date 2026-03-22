"use client";

import { useState, useCallback } from "react";
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
  gameId?: string; // only for spies (to guess)
  playerId?: string;
}

export function LocationGrid({
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

  async function handleGuess() {
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
  }

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
          <div className="grid grid-cols-2 gap-1.5">
            {locations.map((loc) => {
              const isRevealed = revealedLocation === loc.name;
              const isPrevious = prevLocationName === loc.name;
              const isCrossed = crossedOut.has(loc.id);

              return (
                <button
                  key={loc.id}
                  onClick={
                    isSpy
                      ? () => setGuessTarget(loc)
                      : () => toggleCrossOut(loc.id)
                  }
                  className={`text-left text-xs py-1.5 px-2 rounded transition-colors cursor-pointer ${
                    isRevealed
                      ? "bg-primary/10 text-primary font-bold"
                      : isPrevious
                        ? "bg-muted/30 text-muted-foreground line-through opacity-50"
                        : isCrossed
                          ? "bg-muted/30 text-muted-foreground line-through"
                          : isSpy
                            ? "bg-muted/50 hover:bg-muted"
                            : "bg-muted/50 hover:bg-muted/70"
                  }`}
                >
                  {loc.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Spy Guess Confirmation */}
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
}
