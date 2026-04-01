"use client";

import { memo, useMemo } from "react";

import { RevealActions, RevealHeader, RevealPlayerList } from "./reveal-screen-parts";

import type { GameView } from "@/domains/game/schema";

/* ── Main component ───────────────────────────────────── */

interface RevealScreenProps {
  game: GameView;
  playerId: string;
  isHost: boolean;
  onRestart: () => void;
  onLeave: () => void;
}

export const RevealScreen = memo(function RevealScreen({
  game,
  playerId,
  isHost,
  onRestart,
  onLeave,
}: RevealScreenProps) {
  const spyIds = useMemo(() => game.spies ?? [], [game.spies]);
  const location = game.revealedLocation ?? game.location ?? "Unknown";
  const didSpy = spyIds.includes(playerId);
  const spyNames = useMemo(
    () => game.players.filter((p) => spyIds.includes(p.id)).map((p) => p.name),
    [game.players, spyIds],
  );

  return (
    <main className="flex flex-1 items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <RevealHeader
          location={location}
          spyNames={spyNames}
          didSpy={didSpy}
          myRole={game.myRole}
        />
        <RevealPlayerList players={game.players} spyIds={spyIds} />
        <RevealActions isHost={isHost} onRestart={onRestart} onLeave={onLeave} />
      </div>
    </main>
  );
});
