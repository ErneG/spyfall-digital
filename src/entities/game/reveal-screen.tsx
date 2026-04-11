"use client";

import { memo, useMemo } from "react";

import { RevealActions, RevealHeader, RevealPlayerList } from "./reveal-screen-parts";

import type { GameView } from "./schema";

interface RevealScreenProps {
  game: GameView;
  playerId: string;
  isHost: boolean;
  passAndPlay?: boolean;
  isRestarting?: boolean;
  onRestart: () => void;
  onLeave: () => void;
}

export const RevealScreen = memo(function RevealScreen({
  game,
  playerId,
  isHost,
  passAndPlay,
  isRestarting,
  onRestart,
  onLeave,
}: RevealScreenProps) {
  const spyIds = useMemo(() => game.spies ?? [], [game.spies]);
  const location = game.revealedLocation ?? game.location ?? "Unknown";
  const didSpy = passAndPlay ? false : spyIds.includes(playerId);
  const myRole = passAndPlay ? null : game.myRole;
  const spyNames = useMemo(
    () => game.players.filter((player) => spyIds.includes(player.id)).map((player) => player.name),
    [game.players, spyIds],
  );

  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.62)_26%,transparent_52%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.48),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)] p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <RevealHeader location={location} spyNames={spyNames} didSpy={didSpy} myRole={myRole} />
        <RevealPlayerList players={game.players} spyIds={spyIds} />
        <RevealActions
          isHost={isHost}
          isRestarting={isRestarting}
          onRestart={onRestart}
          onLeave={onLeave}
        />
      </div>
    </main>
  );
});
