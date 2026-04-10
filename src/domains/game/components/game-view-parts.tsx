"use client";

import { Eye, EyeOff, MapPin, Shield, AlertTriangle, Pause, Play } from "lucide-react";
import { memo } from "react";

import { Timer } from "@/domains/game/components/timer";
import { VotePanel } from "@/domains/game/components/vote-panel";
import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

import type { GameView as GameViewData } from "@/domains/game/schema";
import type { PlayerInfo } from "@/shared/types/common";

const NAME_TRUNCATE_LENGTH = 6;

/* ── Sub-components ───────────────────────────────────── */

const SpyRole = memo(function SpyRole({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <div className="space-y-2">
      <div className="bg-spy-red/12 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        <AlertTriangle className="text-spy-red h-6 w-6" />
      </div>
      <p className="text-spy-red text-2xl font-bold">{t.game.youAreTheSpy}</p>
      <p className="text-muted-foreground text-[13px]">{t.game.spyHint}</p>
    </div>
  );
});

const AgentRole = memo(function AgentRole({
  location,
  myRole,
  t,
  translateLocation,
  translateRole,
}: {
  location: string | null;
  myRole: string | null;
  t: ReturnType<typeof useTranslation>["t"];
  translateLocation: ReturnType<typeof useTranslation>["translateLocation"];
  translateRole: ReturnType<typeof useTranslation>["translateRole"];
}) {
  return (
    <div className="space-y-2">
      <div className="bg-spy-purple/12 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        <Shield className="text-spy-purple h-6 w-6" />
      </div>
      <div className="flex items-center justify-center gap-2">
        <MapPin className="text-muted-foreground/60 h-4 w-4" />
        <p className="text-lg font-bold text-slate-950">
          {location ? translateLocation(location) : location}
        </p>
      </div>
      <p className="text-muted-foreground text-[13px]">
        {t.game.yourRole}{" "}
        <span className="font-semibold text-slate-950">
          {myRole ? translateRole(myRole) : myRole}
        </span>
      </p>
    </div>
  );
});

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
      className={`rounded-2xl border p-6 text-center shadow-[0_18px_40px_rgba(148,163,184,0.12)] ${
        isRoleRevealed && isSpy
          ? "border-[#e8b7bb]/60 bg-[#fff1f2]"
          : "border-white/80 bg-white/82 backdrop-blur-xl"
      }`}
    >
      <button onClick={onToggle} className="w-full cursor-pointer space-y-3">
        {isRoleRevealed ? (
          <>
            {isSpy ? (
              <SpyRole t={t} />
            ) : (
              <AgentRole
                location={location}
                myRole={myRole}
                t={t}
                translateLocation={translateLocation}
                translateRole={translateRole}
              />
            )}
            <p className="text-muted-foreground/60 mt-3 flex items-center justify-center gap-1 text-xs">
              <EyeOff className="h-3 w-3" /> {t.game.tapToHide}
            </p>
          </>
        ) : (
          <div className="space-y-2 py-4">
            <Eye className="text-muted-foreground/60 mx-auto h-8 w-8" />
            <p className="text-muted-foreground">{t.game.tapToReveal}</p>
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
      <p className="text-muted-foreground/60 mb-2 text-[11px] tracking-[0.08em] uppercase">
        {t.players.title} ({players.length})
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {players.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                p.id === currentPlayerId
                  ? "bg-spy-purple/12 text-spy-purple"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
            <span
              className={`text-[11px] ${p.id === currentPlayerId ? "text-spy-purple" : "text-muted-foreground"}`}
            >
              {p.name.length > NAME_TRUNCATE_LENGTH
                ? `${p.name.slice(0, NAME_TRUNCATE_LENGTH)}...`
                : p.name}
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
    <div className="relative">
      <Timer display={display} isExpired={isExpired} isPaused={!isTimerRunning} variant="hero" />
      {isHost && (
        <button
          onClick={onToggle}
          className="absolute right-2 bottom-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/88 transition-colors hover:bg-white"
        >
          {isTimerRunning ? (
            <Pause className="text-muted-foreground h-4 w-4" />
          ) : (
            <Play className="text-muted-foreground h-4 w-4" />
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
    <div className="fixed right-0 bottom-0 left-0 border-t border-white/70 bg-[#eef3f8]/88 p-4 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md gap-2">
        <VotePanel players={game.players} playerId={playerId} gameId={gameId} />
        {isHost && (
          <Button
            className="bg-spy-red/12 text-spy-red hover:bg-spy-red/20 h-14 rounded-2xl font-semibold"
            onClick={onEndGame}
            disabled={isEnding}
          >
            {isEnding ? t.game.ending : t.game.endGame}
          </Button>
        )}
      </div>
    </div>
  );
});

export { useExpiryBeep, useGameActions } from "./use-game-actions";
