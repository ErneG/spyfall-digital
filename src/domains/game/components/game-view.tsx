"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";

import {
  RoleCard,
  PlayerList,
  TimerSection,
  GameActions,
  useExpiryBeep,
  useGameActions,
} from "@/domains/game/components/game-view-parts";
import { LocationGrid } from "@/domains/game/components/location-grid";
import { RevealScreen } from "@/domains/game/components/reveal-screen";
import { useGameState, useTimer } from "@/domains/game/hooks";
import { useSession } from "@/shared/hooks/use-session";
import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

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
  players?: Array<{ id: string; name: string; isHost: boolean; isOnline: boolean }>;
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
  players: roomPlayers,
}: GameViewProps) {
  const { t } = useTranslation();
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

  const spyCountLabel = useMemo(
    () =>
      hideSpyCount ? null : (
        <p className="text-center text-xs text-[#8E8E93]">
          <AlertTriangle className="mr-1 inline h-3 w-3 text-[#EF4444]" />
          {spyCount === 1 ? "1 spy among you" : `${spyCount} spies among you`}
        </p>
      ),
    [hideSpyCount, spyCount],
  );

  if (!game) {
    if (isLoading) {
      return (
        <main className="flex flex-1 items-center justify-center p-4">
          <p className="text-[#8E8E93]">{t.common.loading}</p>
        </main>
      );
    }
    // Player joined mid-game — they're in the room but not in this round
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <Clock className="mx-auto h-10 w-10 text-[#8E8E93]" />
          <p className="text-lg font-medium">{t.game.gameInProgress}</p>
          <p className="text-sm text-[#8E8E93]">{t.game.waitingForRound}</p>
          {roomPlayers && (
            <PlayerList
              players={roomPlayers.map((p) => ({ ...p, isOnline: true }))}
              currentPlayerId={playerId}
            />
          )}
          <div className="h-px bg-white/5" />
          <Button variant="ghost" className="w-full text-[#8E8E93]" onClick={handleLeave}>
            {t.room.leaveRoom}
          </Button>
        </div>
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
        {spyCountLabel}
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
          prevLocationName={game.isSpy ? null : game.prevLocationName}
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
