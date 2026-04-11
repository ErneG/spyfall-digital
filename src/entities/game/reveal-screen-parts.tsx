"use client";

import { LogOut, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

import {
  RevealGameOver,
  RevealLocation,
  RevealRoleInfo,
  RevealSpyNames,
} from "./reveal-screen-phases";

export const RevealHeader = memo(function RevealHeader({
  location,
  spyNames,
  didSpy,
  myRole,
}: {
  location: string;
  spyNames: string[];
  didSpy: boolean;
  myRole: string | null;
}) {
  return (
    <>
      <RevealGameOver />
      <div className="space-y-5 rounded-2xl border border-white/80 bg-white/82 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.12)] backdrop-blur-xl">
        <RevealLocation location={location} />
        <div className="h-px bg-slate-200/80" />
        <RevealSpyNames spyNames={spyNames} />
        {myRole && (
          <>
            <div className="h-px bg-slate-200/80" />
            <RevealRoleInfo didSpy={didSpy} myRole={myRole} />
          </>
        )}
      </div>
    </>
  );
});

export const RevealPlayerList = memo(function RevealPlayerList({
  players,
  spyIds,
}: {
  players: Array<{ id: string; name: string }>;
  spyIds: string[];
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-white/80 bg-white/82 shadow-[0_18px_40px_rgba(148,163,184,0.12)] backdrop-blur-xl">
      {players.map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 + index * 0.08, duration: 0.35 }}
        >
          {index > 0 && <div className="mx-4 h-px bg-slate-200/80" />}
          <div className="flex h-[56px] items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  spyIds.includes(player.id)
                    ? "bg-spy-red/12 text-spy-red"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{player.name}</span>
            </div>
            {spyIds.includes(player.id) && (
              <span className="bg-spy-red/12 text-spy-red rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                {t.common.spy}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
});

export const RevealActions = memo(function RevealActions({
  isHost,
  isRestarting,
  onRestart,
  onLeave,
}: {
  isHost: boolean;
  isRestarting?: boolean;
  onRestart: () => void;
  onLeave: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {isHost ? (
        <Button
          className="h-14 w-full gap-2 rounded-2xl border border-slate-950/5 bg-slate-950 text-lg font-semibold text-white hover:bg-slate-900"
          onClick={onRestart}
          disabled={isRestarting}
        >
          <RotateCcw className="h-5 w-5" /> {isRestarting ? t.common.loading : t.game.playAgain}
        </Button>
      ) : (
        <p className="text-muted-foreground text-sm">{t.game.waitingForNewRound}</p>
      )}
      <button
        className="text-spy-red hover:text-spy-red/80 w-full py-3 text-center text-[13px] font-semibold transition-colors"
        onClick={onLeave}
      >
        <LogOut className="mr-1 inline h-4 w-4" /> {t.game.leaveRoom}
      </button>
    </div>
  );
});
