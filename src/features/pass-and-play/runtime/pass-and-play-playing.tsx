"use client";

import { AlertTriangle, Eye, Flag } from "lucide-react";
import { memo, useState, useCallback } from "react";

import { TimerSection } from "@/domains/game/components/game-view-parts";
import { PassAndPlayLocationGrid } from "@/domains/game/components/pass-and-play-location-grid";
import { RolePeek } from "@/domains/game/components/pass-and-play-role-peek";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import type { usePassAndPlay } from "./use-pass-and-play";
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
  const [peekMode, setPeekMode] = useState(false);
  const handleStartPeek = useCallback(() => setPeekMode(true), []);
  const handleEndPeek = useCallback(() => setPeekMode(false), []);

  if (peekMode) {
    return (
      <RolePeek gameId={state.activeGameId} allPlayers={allPlayers} onBack={handleEndPeek} t={t} />
    );
  }

  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-[#eef3f8] p-4 pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(255,255,255,0.58)_32%,transparent_54%),radial-gradient(circle_at_82%_18%,rgba(191,219,254,0.52),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.4),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative w-full max-w-md space-y-5">
        {state.roundNumber > 1 && (
          <p className="text-center text-xs font-medium tracking-[0.16em] text-slate-500 uppercase">
            Round {state.roundNumber}
          </p>
        )}
        <TimerSection
          display={state.display}
          isExpired={state.isExpired}
          isTimerRunning={state.isTimerRunning}
          isHost
          onToggle={state.onTimerToggle}
        />
        <SpyCountBanner hide={shouldHideSpyCount} count={spyCount} />
        <PlayerListCard allPlayers={allPlayers} t={t} />
        {state.game && (
          <PassAndPlayLocationGrid
            locations={state.game.allLocations}
            prevLocationName={state.game.prevLocationName}
          />
        )}
      </div>
      <StickyActions state={state} onPeek={handleStartPeek} t={t} />
    </main>
  );
});

const SpyCountBanner = memo(function SpyCountBanner({
  hide,
  count,
}: {
  hide: boolean;
  count: number;
}) {
  if (hide) {
    return null;
  }
  return (
    <p className="text-center text-xs text-slate-500">
      <AlertTriangle className="text-spy-red mr-1 inline h-3 w-3" />
      {count === 1 ? "1 spy among you" : `${count} spies among you`}
    </p>
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
    <div className="rounded-[28px] border border-white/80 bg-white/76 p-4 shadow-[0_18px_40px_rgba(148,163,184,0.16)] backdrop-blur-xl">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
        {t.players.title} ({allPlayers.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {allPlayers.map((p) => (
          <Badge key={p.id} variant="secondary" className="border-white/80 bg-white text-slate-700">
            {p.name}
          </Badge>
        ))}
      </div>
    </div>
  );
});

const StickyActions = memo(function StickyActions({
  state,
  onPeek,
  t,
}: {
  state: HookState;
  onPeek: () => void;
  t: Translations;
}) {
  return (
    <div className="fixed right-0 bottom-0 left-0 border-t border-white/80 bg-white/78 p-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md gap-2">
        <Button
          variant="outline"
          className="h-14 flex-1 gap-2 rounded-2xl border border-white/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
          onClick={onPeek}
        >
          <Eye className="h-4 w-4" /> {t.passAndPlay.peekAtRole}
        </Button>
        <Button
          variant="destructive"
          className="h-14 gap-2 rounded-2xl px-6"
          onClick={state.onEndGameClick}
          disabled={state.endMutation.isPending}
        >
          <Flag className="h-4 w-4" />
          {state.endMutation.isPending ? t.game.ending : t.game.endGame}
        </Button>
      </div>
    </div>
  );
});
