"use client";

import React from "react";

import { LocationSettings } from "@/domains/location/components/location-settings";
import { GameConfig, RoomCodeHeader, PlayerList, StartSection } from "@/domains/room/components";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import type { useRoomPage } from "./use-room-page";

type RoomPageState = ReturnType<typeof useRoomPage>;

interface RoomLobbyProps {
  code: string;
  state: RoomPageState;
}

export const RoomLobby = React.memo(function RoomLobby({ code, state }: RoomLobbyProps) {
  if (!state.session) {
    return null;
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <RoomLobbyContent code={code} state={state} session={state.session} />
    </main>
  );
});

interface RoomLobbyContentProps {
  code: string;
  state: RoomPageState;
  session: NonNullable<RoomPageState["session"]>;
}

const RoomLobbyContent = React.memo(function RoomLobbyContent({
  code,
  state,
  session,
}: RoomLobbyContentProps) {
  const { t, room, isConnected, isCopied, error, isLocationsOpen } = state;
  const { setIsLocationsOpen, startGameMutation, players, handleCopy, handleLeave } = state;

  return (
    <div className="w-full max-w-md space-y-4">
      <RoomCodeHeader
        code={code}
        isCopied={isCopied}
        isConnected={isConnected}
        onCopy={handleCopy}
      />
      {room && (
        <GameConfig
          roomCode={code}
          playerId={session.playerId}
          isHost={session.isHost}
          timeLimit={room.timeLimit}
          spyCount={room.spyCount}
          autoStartTimer={room.autoStartTimer}
          hideSpyCount={room.hideSpyCount}
          moderatorMode={room.moderatorMode}
          selectedLocationCount={room.selectedLocationCount}
          totalLocationCount={room.totalLocationCount}
          onOpenLocations={state.handleOpenLocations}
        />
      )}
      <LocationSettings
        open={isLocationsOpen}
        onOpenChange={setIsLocationsOpen}
        roomCode={code}
        playerId={session.playerId}
      />
      <PlayerList players={players} currentPlayerId={session.playerId} />
      <StartSection
        isHost={session.isHost}
        isStarting={startGameMutation.isPending}
        playerCount={players.length}
        error={error}
        onStart={state.handleStartClick}
      />
      <Separator />
      <Button variant="ghost" className="text-muted-foreground w-full" onClick={handleLeave}>
        {t.room.leaveRoom}
      </Button>
    </div>
  );
});

interface LoadingSpinnerProps {
  label: string;
}

export const RoomLoadingSpinner = React.memo(function RoomLoadingSpinner({
  label,
}: LoadingSpinnerProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="space-y-3 text-center">
        <div className="border-muted border-t-primary mx-auto h-8 w-8 animate-spin rounded-full border-4" />
        <p className="text-muted-foreground">{label}</p>
      </div>
    </main>
  );
});
