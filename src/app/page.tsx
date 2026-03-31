"use client";

import {
  HeroSection,
  ModeSelector,
  CreateRoomForm,
  JoinRoomForm,
  PassAndPlayForm,
  FooterInfo,
  useHomeState,
} from "./home-parts";

export default function Home() {
  const {
    mode,
    name,
    joinCode,
    playerNames,
    isLoading,
    error,
    pnpTimeLimit,
    pnpSpyCount,
    shouldPnpHideSpyCount,
    handleSetModeCreate,
    handleSetModeJoin,
    handleSetModePassAndPlay,
    handleBack,
    handleNameChange,
    handleJoinCodeChange,
    handleCreateKeyDown,
    handleJoinKeyDown,
    handleCreateClick,
    handleJoinClick,
    handlePassAndPlayClick,
    handlePlayerNameChange,
    handleAddPlayer,
    handleRemovePlayer,
    handlePnpTimeLimitChange,
    handlePnpSpyCountChange,
    handlePnpHideSpyCountChange,
  } = useHomeState();

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <HeroSection />

        {mode === "idle" && (
          <ModeSelector
            onCreateMode={handleSetModeCreate}
            onJoinMode={handleSetModeJoin}
            onPassAndPlayMode={handleSetModePassAndPlay}
          />
        )}

        {mode === "create" && (
          <CreateRoomForm
            name={name}
            error={error}
            isLoading={isLoading}
            onNameChange={handleNameChange}
            onKeyDown={handleCreateKeyDown}
            onBack={handleBack}
            onCreate={handleCreateClick}
          />
        )}

        {mode === "join" && (
          <JoinRoomForm
            name={name}
            joinCode={joinCode}
            error={error}
            isLoading={isLoading}
            onNameChange={handleNameChange}
            onJoinCodeChange={handleJoinCodeChange}
            onKeyDown={handleJoinKeyDown}
            onBack={handleBack}
            onJoin={handleJoinClick}
          />
        )}

        {mode === "pass-and-play" && (
          <PassAndPlayForm
            playerNames={playerNames}
            error={error}
            isLoading={isLoading}
            timeLimit={pnpTimeLimit}
            spyCount={pnpSpyCount}
            hideSpyCount={shouldPnpHideSpyCount}
            onPlayerNameChange={handlePlayerNameChange}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onBack={handleBack}
            onStart={handlePassAndPlayClick}
            onTimeLimitChange={handlePnpTimeLimitChange}
            onSpyCountChange={handlePnpSpyCountChange}
            onHideSpyCountChange={handlePnpHideSpyCountChange}
          />
        )}

        <FooterInfo />
      </div>
    </main>
  );
}
