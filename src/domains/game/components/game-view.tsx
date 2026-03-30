"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGameState, useTimer } from "@/domains/game/hooks";
import { useSession } from "@/shared/hooks/use-session";
import { LocationGrid } from "@/domains/game/components/location-grid";
import { RevealScreen } from "@/domains/game/components/reveal-screen";
import { AlertTriangle } from "lucide-react";
import {
  RoleCard,
  PlayerList,
  TimerSection,
  GameActions,
  useExpiryBeep,
  useGameActions,
} from "@/domains/game/components/game-view-parts";

const REVEAL_PHASES = new Set(["REVEAL", "FINISHED"]);

interface GameViewProps {
  gameId: string;
  playerId: string;
  isHost: boolean;
  roomCode: string;
  timeLimit: number;
  gameStartedAt: string | null;
  hideSpyCount: boolean;
  spyCount: number;
  isTimerRunning: boolean;
}

export function GameView({
  gameId,
  playerId,
  isHost,
  roomCode: _roomCode,
  timeLimit,
  gameStartedAt,
  hideSpyCount,
  spyCount,
  isTimerRunning: initialTimerRunning,
}: GameViewProps) {
  const router = useRouter();
  const { clearSession } = useSession();
  const { game, isLoading } = useGameState(gameId, playerId);
  const isTimerRunning = game?.timerRunning ?? initialTimerRunning;
  const startedAt = game?.startedAt ?? gameStartedAt;
  const effectiveTimeLimit = game?.timeLimit ?? timeLimit;
  const { display, isExpired } = useTimer(startedAt, effectiveTimeLimit, isTimerRunning);
  const [isRoleRevealed, setIsRoleRevealed] = useState(false);
  const { timerMutation, endMutation, restartMutation } = useGameActions(gameId, playerId);

  useExpiryBeep(isExpired);

  const onTimerToggle = useCallback(() => {
    timerMutation.mutate(isTimerRunning);
  }, [timerMutation, isTimerRunning]);
  const onEndGameClick = useCallback(() => {
    endMutation.mutate();
  }, [endMutation]);
  const onRestart = useCallback(() => {
    restartMutation.mutate();
  }, [restartMutation]);
  const handleLeave = useCallback(() => {
    clearSession();
    router.push("/");
  }, [clearSession, router]);
  const toggleRole = useCallback(() => {
    setIsRoleRevealed((previous) => !previous);
  }, []);

  const spyBadges = useMemo(
    () =>
      hideSpyCount
        ? null
        : Array.from({ length: spyCount }, (_, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-[#EF4444]/12 px-2.5 py-1 text-xs font-semibold text-[#EF4444]"
            >
              <AlertTriangle className="mr-1 h-3 w-3" /> Spy
            </span>
          )),
    [hideSpyCount, spyCount],
  );

  if (!game) {
    const message = isLoading ? "Loading game..." : "Failed to load game";
    const className = isLoading ? "text-[#8E8E93]" : "text-[#EF4444]";
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p className={className}>{message}</p>
      </main>
    );
  }

  const isRevealPhase = REVEAL_PHASES.has(game.phase);
  if (isRevealPhase) {
    return (
      <RevealScreen
        game={game}
        playerId={playerId}
        isHost={isHost}
        onRestart={onRestart}
        onLeave={handleLeave}
      />
    );
  }

  const revealedLocation = game.isSpy ? null : game.location;
  const spyGameId = game.isSpy ? gameId : undefined;
  const spyPlayerId = game.isSpy ? playerId : undefined;

  return (
    <main className="flex flex-1 flex-col items-center bg-black p-4 pb-24">
      <div className="w-full max-w-md space-y-5">
        <TimerSection
          display={display}
          isExpired={isExpired}
          isTimerRunning={isTimerRunning}
          isHost={isHost}
          onToggle={onTimerToggle}
        />
        {spyBadges && <div className="flex justify-center gap-1">{spyBadges}</div>}
        <RoleCard
          isSpy={game.isSpy}
          isRoleRevealed={isRoleRevealed}
          location={game.location}
          myRole={game.myRole}
          onToggle={toggleRole}
        />
        <PlayerList players={game.players} currentPlayerId={playerId} />
        <LocationGrid
          locations={game.allLocations}
          revealedLocation={revealedLocation}
          prevLocationName={game.prevLocationName}
          gameId={spyGameId}
          playerId={spyPlayerId}
        />
        <div className="h-px bg-white/5" />
        <GameActions
          isHost={isHost}
          isEnding={endMutation.isPending}
          onEndGame={onEndGameClick}
          game={game}
          playerId={playerId}
          gameId={gameId}
        />
      </div>
    </main>
  );
}
