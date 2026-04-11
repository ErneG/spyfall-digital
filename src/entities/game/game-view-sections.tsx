"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { memo } from "react";

import { Button } from "@/shared/ui/button";

import { GameActions, PlayerList, RoleCard, TimerSection } from "./game-view-parts";
import { LocationGrid } from "./location-grid";

import type { GameView } from "./schema";

interface WaitingViewProps {
  gameInProgressLabel: string;
  waitingForRoundLabel: string;
  leaveLabel: string;
  players?: Array<{ id: string; name: string; isHost: boolean; isOnline: boolean }>;
  currentPlayerId: string;
  onLeave: () => void;
}

export const GameWaitingView = memo(function GameWaitingView({
  gameInProgressLabel,
  waitingForRoundLabel,
  leaveLabel,
  players,
  currentPlayerId,
  onLeave,
}: WaitingViewProps) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)] p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <Clock className="text-muted-foreground mx-auto h-10 w-10" />
        <p className="text-lg font-medium">{gameInProgressLabel}</p>
        <p className="text-muted-foreground text-sm">{waitingForRoundLabel}</p>
        {players && (
          <PlayerList
            players={players.map((player) => ({ ...player, isOnline: true }))}
            currentPlayerId={currentPlayerId}
          />
        )}
        <div className="h-px bg-slate-200/80" />
        <Button variant="ghost" className="text-muted-foreground w-full" onClick={onLeave}>
          {leaveLabel}
        </Button>
      </div>
    </main>
  );
});

interface PlayingViewProps {
  display: string;
  isExpired: boolean;
  isTimerRunning: boolean;
  isHost: boolean;
  isRoleRevealed: boolean;
  isEnding: boolean;
  spyCountLabel: string | null;
  game: GameView;
  gameId: string;
  playerId: string;
  onTimerToggle: () => void;
  toggleRole: () => void;
  onEndGame: () => void;
}

export const GamePlayingView = memo(function GamePlayingView(props: PlayingViewProps) {
  const { game, gameId, playerId, spyCountLabel } = props;
  const revealedLocation = game.isSpy ? null : game.location;
  const spyGameId = game.isSpy ? gameId : undefined;
  const spyPlayerId = game.isSpy ? playerId : undefined;

  return (
    <main className="flex flex-1 flex-col items-center bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.62)_26%,transparent_52%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.48),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)] p-4 pb-28">
      <div className="w-full max-w-md space-y-5">
        <TimerSection
          display={props.display}
          isExpired={props.isExpired}
          isTimerRunning={props.isTimerRunning}
          isHost={props.isHost}
          onToggle={props.onTimerToggle}
        />

        {spyCountLabel && (
          <p className="text-muted-foreground text-center text-xs">
            <AlertTriangle className="text-spy-red mr-1 inline h-3 w-3" />
            {spyCountLabel}
          </p>
        )}

        <RoleCard
          isSpy={game.isSpy}
          isRoleRevealed={props.isRoleRevealed}
          location={game.location}
          myRole={game.myRole}
          onToggle={props.toggleRole}
        />

        <PlayerList players={game.players} currentPlayerId={playerId} />

        <LocationGrid
          locations={game.allLocations}
          revealedLocation={revealedLocation}
          prevLocationName={game.isSpy ? null : game.prevLocationName}
          gameId={spyGameId}
          playerId={spyPlayerId}
        />
      </div>

      <GameActions
        isHost={props.isHost}
        isEnding={props.isEnding}
        onEndGame={props.onEndGame}
        game={game}
        playerId={playerId}
        gameId={gameId}
      />
    </main>
  );
});
