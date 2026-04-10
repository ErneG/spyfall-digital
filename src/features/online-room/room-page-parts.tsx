"use client";

import React from "react";

import { CollectionPicker } from "@/domains/collection/components/collection-picker";
import { LocationSettings } from "@/domains/location/components/location-settings";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import { GameConfig } from "./components/game-config";
import { PlayerList } from "./components/player-list";
import { RoomCodeHeader } from "./components/room-code-header";
import { StartSection } from "./components/start-section";

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
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.62)_26%,transparent_52%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.55),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)] px-4 py-8">
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
  const { t, room, isConnected, isCopied, error, isCollectionPickerOpen, isLocationsOpen } = state;
  const {
    setIsCollectionPickerOpen,
    setIsLocationsOpen,
    startGameMutation,
    players,
    handleCopy,
    handleLeave,
  } = state;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <section className="rounded-[36px] border border-white/80 bg-white/68 p-5 shadow-[0_40px_120px_rgba(148,163,184,0.22)] backdrop-blur-2xl sm:p-7">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
              Online room
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Gather the room before the round starts
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Adjust the lobby settings, review the active location pool, and start when everyone is
              ready. The real-time layer is now query-driven, but the room should still feel calm
              and lightweight.
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.92fr)]">
            <div className="space-y-5">
              <RoomCodeHeader
                code={code}
                isCopied={isCopied}
                isConnected={isConnected}
                onCopy={handleCopy}
              />
              {room ? (
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
                  onOpenCollectionPicker={state.handleOpenCollectionPicker}
                  onOpenLocations={state.handleOpenLocations}
                />
              ) : null}
            </div>
            <div className="space-y-5">
              <PlayerList players={players} currentPlayerId={session.playerId} />
              <StartSection
                isHost={session.isHost}
                isStarting={startGameMutation.isPending}
                playerCount={players.length}
                error={error}
                onStart={state.handleStartClick}
              />
              <Separator className="bg-slate-200/80" />
              <Button
                variant="ghost"
                className="w-full rounded-full text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
                onClick={handleLeave}
              >
                {t.room.leaveRoom}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <LocationSettings
        open={isLocationsOpen}
        onOpenChange={setIsLocationsOpen}
        roomCode={code}
        playerId={session.playerId}
      />
      <CollectionPicker
        open={isCollectionPickerOpen}
        onOpenChange={setIsCollectionPickerOpen}
        roomCode={code}
        playerId={session.playerId}
        onImported={() => {}}
      />
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
    <main className="min-h-dvh bg-[linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)] p-4">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="text-slate-500">{label}</p>
      </div>
    </main>
  );
});
