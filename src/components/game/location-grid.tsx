"use client";

import { useState } from "react";
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
  revealedLocation: string | null; // null for spies
  gameId?: string; // only for spies (to guess)
  playerId?: string;
}

export function LocationGrid({ locations, revealedLocation, gameId, playerId }: LocationGridProps) {
  const [guessTarget, setGuessTarget] = useState<LocationInfo | null>(null);
  const [guessing, setGuessing] = useState(false);
  const isSpy = !!gameId;

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
              return (
                <button
                  key={loc.id}
                  onClick={isSpy ? () => setGuessTarget(loc) : undefined}
                  className={`text-left text-xs py-1.5 px-2 rounded transition-colors ${
                    isRevealed
                      ? "bg-primary/10 text-primary font-semibold"
                      : isSpy
                        ? "bg-muted/50 hover:bg-muted cursor-pointer"
                        : "bg-muted/50"
                  }`}
                >
                  {loc.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Spy Guess Confirmation Dialog */}
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
            <Button variant="destructive" onClick={handleGuess} disabled={guessing}>
              {guessing ? "Guessing..." : "Confirm Guess"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
