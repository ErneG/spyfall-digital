"use client";

import {
  HeroSection,
  ModeSelector,
  CreateRoomForm,
  JoinRoomForm,
  FooterInfo,
  useHomeState,
} from "./home-parts";

export default function Home() {
  const {
    mode, name, joinCode, isLoading, error,
    handleSetModeCreate, handleSetModeJoin, handleBack,
    handleNameChange, handleJoinCodeChange,
    handleCreateKeyDown, handleJoinKeyDown,
    handleCreateClick, handleJoinClick,
  } = useHomeState();

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <HeroSection />

        {mode === "idle" && (
          <ModeSelector onCreateMode={handleSetModeCreate} onJoinMode={handleSetModeJoin} />
        )}

        {mode === "create" && (
          <CreateRoomForm
            name={name} error={error} isLoading={isLoading}
            onNameChange={handleNameChange} onKeyDown={handleCreateKeyDown}
            onBack={handleBack} onCreate={handleCreateClick}
          />
        )}

        {mode === "join" && (
          <JoinRoomForm
            name={name} joinCode={joinCode} error={error} isLoading={isLoading}
            onNameChange={handleNameChange} onJoinCodeChange={handleJoinCodeChange}
            onKeyDown={handleJoinKeyDown} onBack={handleBack} onJoin={handleJoinClick}
          />
        )}

        <FooterInfo />
      </div>
    </main>
  );
}
