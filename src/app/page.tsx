"use client";

import { memo } from "react";

import {
  HeroSection,
  ModeSelector,
  CreateRoomForm,
  JoinRoomForm,
  PassAndPlayForm,
  FooterInfo,
  useHomeState,
} from "./home-parts";

const ModeContent = memo(function ModeContent(props: ReturnType<typeof useHomeState>) {
  const { mode } = props;

  if (mode === "idle") {
    return (
      <ModeSelector
        onCreateMode={props.handleSetModeCreate}
        onJoinMode={props.handleSetModeJoin}
        onPassAndPlayMode={props.handleSetModePassAndPlay}
      />
    );
  }

  if (mode === "create") {
    return (
      <CreateRoomForm
        name={props.name}
        error={props.error}
        isLoading={props.isLoading}
        onNameChange={props.handleNameChange}
        onKeyDown={props.handleCreateKeyDown}
        onBack={props.handleBack}
        onCreate={props.handleCreateClick}
      />
    );
  }

  if (mode === "join") {
    return (
      <JoinRoomForm
        name={props.name}
        joinCode={props.joinCode}
        error={props.error}
        isLoading={props.isLoading}
        onNameChange={props.handleNameChange}
        onJoinCodeChange={props.handleJoinCodeChange}
        onKeyDown={props.handleJoinKeyDown}
        onBack={props.handleBack}
        onJoin={props.handleJoinClick}
      />
    );
  }

  return (
    <PassAndPlayForm
      playerNames={props.playerNames}
      error={props.error}
      isLoading={props.isLoading}
      timeLimit={props.pnpTimeLimit}
      spyCount={props.pnpSpyCount}
      hideSpyCount={props.shouldPnpHideSpyCount}
      onPlayerNameChange={props.handlePlayerNameChange}
      onAddPlayer={props.handleAddPlayer}
      onRemovePlayer={props.handleRemovePlayer}
      onBack={props.handleBack}
      onStart={props.handlePassAndPlayClick}
      onTimeLimitChange={props.handlePnpTimeLimitChange}
      onSpyCountChange={props.handlePnpSpyCountChange}
      onHideSpyCountChange={props.handlePnpHideSpyCountChange}
    />
  );
});

export default function Home() {
  const state = useHomeState();

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <HeroSection />
        <ModeContent {...state} />
        <FooterInfo />
      </div>
    </main>
  );
}
