"use client";

import { AlertTriangle, Clock } from "lucide-react";
import React from "react";

import {
  RoleCard,
  PlayerList,
  TimerSection,
  GameActions,
} from "@/domains/game/components/game-view-parts";
import { LocationGrid } from "@/domains/game/components/location-grid";
import { Button } from "@/shared/ui/button";

import type { GameView } from "@/domains/game/schema";

interface WaitingViewProps {
  gameInProgressLabel: string;
  waitingForRoundLabel: string;
  leaveLabel: string;
  players?: Array<{ id: string; name: string; isHost: boolean; isOnline: boolean }>;
  currentPlayerId: string;
  onLeave: () => void;
}

export const GameWaitingView = React.memo(function GameWaitingView({
  gameInProgressLabel,
  waitingForRoundLabel,
  leaveLabel,
  players,
  currentPlayerId,
  onLeave,
}: WaitingViewProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <Clock className="text-muted-foreground mx-auto h-10 w-10" />
        <p className="text-lg font-medium">{gameInProgressLabel}</p>
        <p className="text-muted-foreground text-sm">{waitingForRoundLabel}</p>
        {players && (
          <PlayerList
            players={players.map((p) => ({ ...p, isOnline: true }))}
            currentPlayerId={currentPlayerId}
          />
        )}
        <div className="h-px bg-white/5" />
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

export const GamePlayingView = React.memo(function GamePlayingView(props: PlayingViewProps) {
  const { game, gameId, playerId, spyCountLabel } = props;
  const revealedLocation = game.isSpy ? null : game.location;
  const spyGameId = game.isSpy ? gameId : undefined;
  const spyPlayerId = game.isSpy ? playerId : undefined;

  return (
    <main className="flex flex-1 flex-col items-center bg-black p-4 pb-28">
      <div className="w-full max-w-md space-y-5">
        {/* Timer as hero element */}
        <TimerSection
          display={props.display}
          isExpired={props.isExpired}
          isTimerRunning={props.isTimerRunning}
          isHost={props.isHost}
          onToggle={props.onTimerToggle}
        />

        {/* Spy count warning - compact banner */}
        {spyCountLabel && (
          <p className="text-muted-foreground text-center text-xs">
            <AlertTriangle className="text-spy-red mr-1 inline h-3 w-3" />
            {spyCountLabel}
          </p>
        )}

        {/* Role card */}
        <RoleCard
          isSpy={game.isSpy}
          isRoleRevealed={props.isRoleRevealed}
          location={game.location}
          myRole={game.myRole}
          onToggle={props.toggleRole}
        />

        {/* Player list */}
        <PlayerList players={game.players} currentPlayerId={playerId} />

        {/* Location grid */}
        <LocationGrid
          locations={game.allLocations}
          revealedLocation={revealedLocation}
          prevLocationName={game.isSpy ? null : game.prevLocationName}
          gameId={spyGameId}
          playerId={spyPlayerId}
        />
      </div>

      {/* Sticky bottom action bar */}
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
