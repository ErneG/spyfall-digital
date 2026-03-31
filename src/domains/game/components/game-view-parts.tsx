"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, MapPin, Shield, AlertTriangle, Pause, Play } from "lucide-react";
import { useEffect, useRef, memo } from "react";

import { toggleTimer, endGame, restartGame } from "@/domains/game/actions";
import { Timer } from "@/domains/game/components/timer";
import { VotePanel } from "@/domains/game/components/vote-panel";
import { gameKeys } from "@/domains/game/hooks";
import { useTranslation } from "@/shared/i18n/context";
import { unwrapAction } from "@/shared/lib/unwrap-action";
import { Button } from "@/shared/ui/button";

import type { GameView as GameViewData } from "@/domains/game/schema";
import type { PlayerInfo } from "@/shared/types/common";

const BEEP_FREQUENCY = 800;
const BEEP_VOLUME = 0.3;
const BEEP_GAP = 0.3;
const BEEP_DURATION = 0.15;
const BEEP_COUNT = 2;

/* ── Sub-components ───────────────────────────────────── */

export const RoleCard = memo(function RoleCard({
  isSpy,
  isRoleRevealed,
  location,
  myRole,
  onToggle,
}: {
  isSpy: boolean;
  isRoleRevealed: boolean;
  location: string | null;
  myRole: string | null;
  onToggle: () => void;
}) {
  const { t, translateLocation, translateRole } = useTranslation();
  return (
    <div
      className={`rounded-2xl p-6 text-center ${isRoleRevealed && isSpy ? "bg-[#EF4444]/12" : "bg-[#141414]"}`}
    >
      <button onClick={onToggle} className="w-full cursor-pointer space-y-3">
        {isRoleRevealed ? (
          <>
            {isSpy ? (
              <div className="space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EF4444]/12">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                </div>
                <p className="text-2xl font-bold text-[#EF4444]">{t.game.youAreTheSpy}</p>
                <p className="text-[13px] text-[#8E8E93]">{t.game.spyHint}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#8B5CF6]/12">
                  <Shield className="h-6 w-6 text-[#8B5CF6]" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4 text-[#48484A]" />
                  <p className="text-lg font-bold">
                    {location ? translateLocation(location) : location}
                  </p>
                </div>
                <p className="text-[13px] text-[#8E8E93]">
                  {t.game.yourRole}{" "}
                  <span className="font-semibold text-white">
                    {myRole ? translateRole(myRole) : myRole}
                  </span>
                </p>
              </div>
            )}
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-[#48484A]">
              <EyeOff className="h-3 w-3" /> {t.game.tapToHide}
            </p>
          </>
        ) : (
          <div className="space-y-2 py-4">
            <Eye className="mx-auto h-8 w-8 text-[#48484A]" />
            <p className="text-[#8E8E93]">{t.game.tapToReveal}</p>
          </div>
        )}
      </button>
    </div>
  );
});

export const PlayerList = memo(function PlayerList({
  players,
  currentPlayerId,
}: {
  players: PlayerInfo[];
  currentPlayerId: string;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="mb-2 text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
        {t.players.title} ({players.length})
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {players.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                p.id === currentPlayerId
                  ? "bg-[#8B5CF6]/12 text-[#8B5CF6]"
                  : "bg-white/8 text-[#8E8E93]"
              }`}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
            <span
              className={`text-[11px] ${p.id === currentPlayerId ? "text-[#8B5CF6]" : "text-[#8E8E93]"}`}
            >
              {p.name.length > 6 ? `${p.name.slice(0, 6)}...` : p.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export const TimerSection = memo(function TimerSection({
  display,
  isExpired,
  isTimerRunning,
  isHost,
  onToggle,
}: {
  display: string;
  isExpired: boolean;
  isTimerRunning: boolean;
  isHost: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Timer display={display} isExpired={isExpired} isPaused={!isTimerRunning} />
      </div>
      {isHost && (
        <button
          onClick={onToggle}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#141414] transition-colors hover:bg-[#1C1C1E]"
        >
          {isTimerRunning ? (
            <Pause className="h-5 w-5 text-[#8E8E93]" />
          ) : (
            <Play className="h-5 w-5 text-[#8E8E93]" />
          )}
        </button>
      )}
    </div>
  );
});

export const GameActions = memo(function GameActions({
  isHost,
  isEnding,
  onEndGame,
  game,
  playerId,
  gameId,
}: {
  isHost: boolean;
  isEnding: boolean;
  onEndGame: () => void;
  game: GameViewData;
  playerId: string;
  gameId: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2">
      {isHost && (
        <Button
          className="h-[52px] flex-1 rounded-2xl bg-[#EF4444]/12 font-semibold text-[#EF4444] hover:bg-[#EF4444]/20"
          onClick={onEndGame}
          disabled={isEnding}
        >
          {isEnding ? t.game.ending : t.game.endGame}
        </Button>
      )}
      <VotePanel players={game.players} playerId={playerId} gameId={gameId} />
    </div>
  );
});

/* ── Hooks ────────────────────────────────────────────── */

export function useExpiryBeep(isExpired: boolean) {
  const hasBeeped = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isExpired && !hasBeeped.current) {
      hasBeeped.current = true;
      try {
        audioCtxRef.current ??= new AudioContext();
        const ctx = audioCtxRef.current;
        for (let i = 0; i < BEEP_COUNT; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = BEEP_FREQUENCY;
          gain.gain.value = BEEP_VOLUME;
          osc.start(ctx.currentTime + i * BEEP_GAP);
          osc.stop(ctx.currentTime + i * BEEP_GAP + BEEP_DURATION);
        }
      } catch {
        // Audio not available
      }
    }
  }, [isExpired]);
}

export function useGameActions(gameId: string, playerId: string) {
  const queryClient = useQueryClient();
  const queryKey = gameKeys.state(gameId, playerId);

  const timerMutation = useMutation({
    mutationFn: (isCurrentlyRunning: boolean) =>
      toggleTimer({ gameId, playerId, action: isCurrentlyRunning ? "pause" : "resume" }).then(
        unwrapAction,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const endMutation = useMutation({
    mutationFn: () => endGame({ gameId, playerId }).then(unwrapAction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const restartMutation = useMutation({
    mutationFn: () => restartGame({ gameId, playerId }).then(unwrapAction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { timerMutation, endMutation, restartMutation };
}
