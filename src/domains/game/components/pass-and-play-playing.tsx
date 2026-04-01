"use client";

import { AlertTriangle, Hand, LogOut, Crosshair } from "lucide-react";
import { memo, useMemo } from "react";

import { TimerSection } from "@/domains/game/components/game-view-parts";
import { LocationGrid } from "@/domains/game/components/location-grid";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

import type { usePassAndPlay } from "@/domains/game/components/use-pass-and-play";
import type { useTranslation } from "@/shared/i18n/context";

type HookState = ReturnType<typeof usePassAndPlay>;
type Translations = ReturnType<typeof useTranslation>["t"];

interface PlayingPhaseProps {
  state: HookState;
  allPlayers: Array<{ id: string; name: string }>;
  shouldHideSpyCount: boolean;
  spyCount: number;
  t: Translations;
}

export const PlayingPhase = memo(function PlayingPhase({
  state,
  allPlayers,
  shouldHideSpyCount,
  spyCount,
  t,
}: PlayingPhaseProps) {
  const spyCountLabel = useMemo(
    () =>
      shouldHideSpyCount ? null : (
        <p className="text-muted-foreground text-center text-xs">
          <AlertTriangle className="mr-1 inline h-3 w-3 text-[#EF4444]" />
          {spyCount === 1 ? "1 spy among you" : `${spyCount} spies among you`}
        </p>
      ),
    [shouldHideSpyCount, spyCount],
  );

  return (
    <main className="flex flex-1 flex-col items-center p-4 pb-24">
      <div className="w-full max-w-md space-y-4">
        <TimerSection
          display={state.display}
          isExpired={state.isExpired}
          isTimerRunning={state.isTimerRunning}
          isHost
          onToggle={state.onTimerToggle}
        />
        {spyCountLabel}
        <PlayerListCard allPlayers={allPlayers} t={t} />
        {state.game && (
          <LocationGrid
            locations={state.game.allLocations}
            revealedLocation={state.game.location}
            prevLocationName={state.game.prevLocationName}
          />
        )}
        <Separator />
        <PlayingActions state={state} t={t} />
      </div>
    </main>
  );
});

const PlayerListCard = memo(function PlayerListCard({
  allPlayers,
  t,
}: {
  allPlayers: Array<{ id: string; name: string }>;
  t: Translations;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <p className="text-muted-foreground mb-2 text-xs">
          {t.players.title} ({allPlayers.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {allPlayers.map((p) => (
            <Badge key={p.id} variant="secondary">
              {p.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

const PlayingActions = memo(function PlayingActions({
  state,
  t,
}: {
  state: HookState;
  t: Translations;
}) {
  return (
    <>
      <Button
        variant="outline"
        className="border-destructive/50 text-destructive h-12 w-full gap-2"
        onClick={state.spyGuess.handleStartSpyGuess}
      >
        <Crosshair className="h-4 w-4" /> {t.passAndPlay.spyGuessLocation}
      </Button>

      <div className="flex gap-2">
        <Button
          variant="destructive"
          className="flex-1"
          onClick={state.onEndGameClick}
          disabled={state.endMutation.isPending}
        >
          {state.endMutation.isPending ? t.game.ending : t.game.endGame}
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={state.voting.handleStartVoting}>
          <Hand className="h-4 w-4" /> {t.game.vote}
        </Button>
      </div>

      <Button
        variant="ghost"
        className="text-muted-foreground w-full gap-2"
        onClick={state.handleLeave}
      >
        <LogOut className="h-4 w-4" /> {t.game.leaveGame}
      </Button>
    </>
  );
});
