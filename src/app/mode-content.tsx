"use client";

import { memo } from "react";

import {
  ModeSelector,
  CreateRoomForm,
  JoinRoomForm,
  PassAndPlayForm,
  type useHomeState,
} from "./home-parts";

type ModeContentProps = ReturnType<typeof useHomeState>;

export const ModeContent = memo(function ModeContent(props: ModeContentProps) {
  switch (props.mode) {
    case "idle":
      return (
        <ModeSelector
          onCreateMode={props.handleSetModeCreate}
          onJoinMode={props.handleSetModeJoin}
          onPassAndPlayMode={props.handleSetModePassAndPlay}
        />
      );
    case "create":
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
    case "join":
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
    case "pass-and-play":
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
          onReorderPlayers={props.handleReorderPlayers}
          onBack={props.handleBack}
          onStart={props.handlePassAndPlayClick}
          onTimeLimitChange={props.handlePnpTimeLimitChange}
          onSpyCountChange={props.handlePnpSpyCountChange}
          onHideSpyCountChange={props.handlePnpHideSpyCountChange}
          editions={props.pnpEditions}
          onEditionsChange={props.handlePnpEditionsChange}
        />
      );
  }
});
