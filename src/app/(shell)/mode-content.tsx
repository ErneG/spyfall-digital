"use client";

import { memo } from "react";

import { ModeSelector, CreateRoomForm, JoinRoomForm, type useHomeState } from "./home-parts";

type ModeContentProps = ReturnType<typeof useHomeState>;

export const ModeContent = memo(function ModeContent(props: ModeContentProps) {
  switch (props.mode) {
    case "idle":
      return (
        <ModeSelector
          onCreateMode={props.handleSetModeCreate}
          onJoinMode={props.handleSetModeJoin}
          onPassAndPlayMode={props.handleOpenPassAndPlaySetup}
        />
      );
    case "create":
      return (
        <CreateRoomForm
          name={props.name}
          error={props.error}
          isLoading={props.isLoading}
          onNameChange={props.handleNameChange}
          onNameSelect={props.handleNameSelect}
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
          onNameSelect={props.handleNameSelect}
          onJoinCodeChange={props.handleJoinCodeChange}
          onKeyDown={props.handleJoinKeyDown}
          onBack={props.handleBack}
          onJoin={props.handleJoinClick}
        />
      );
  }
});
