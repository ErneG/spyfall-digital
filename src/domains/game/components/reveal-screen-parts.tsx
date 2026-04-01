"use client";

import { MapPin, AlertTriangle, Trophy, RotateCcw, LogOut } from "lucide-react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

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
  const { t, translateLocation, translateRole } = useTranslation();
  return (
    <>
      <div className="space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/12">
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold">{t.game.gameOver}</h1>
      </div>

      <div className="space-y-5 rounded-2xl bg-[#141414] p-6">
        <div className="space-y-1">
          <p className="flex items-center justify-center gap-1 text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
            <MapPin className="h-3 w-3" /> {t.game.locationWas}
          </p>
          <p className="text-2xl font-bold">{translateLocation(location)}</p>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-2">
          <p className="flex items-center justify-center gap-1 text-[11px] tracking-[0.08em] text-[#48484A] uppercase">
            <AlertTriangle className="h-3 w-3" />
            {spyNames.length === 1 ? t.game.spyWas : t.game.spiesWere}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {spyNames.map((name) => (
              <span
                key={name}
                className="rounded-full bg-[#EF4444]/12 px-4 py-1.5 text-base font-semibold text-[#EF4444]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/5" />
        <p className="text-[13px] text-[#8E8E93]">
          {didSpy ? t.game.youWereSpy : t.game.yourRoleWas}{" "}
          <span className="font-semibold text-white">
            {myRole ? translateRole(myRole) : myRole}
          </span>
        </p>
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
    <div className="rounded-2xl bg-[#141414]">
      {players.map((p, index) => (
        <div key={p.id}>
          {index > 0 && <div className="mx-4 h-px bg-white/5" />}
          <div className="flex h-[56px] items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  spyIds.includes(p.id)
                    ? "bg-[#EF4444]/12 text-[#EF4444]"
                    : "bg-white/8 text-[#8E8E93]"
                }`}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{p.name}</span>
            </div>
            {spyIds.includes(p.id) && (
              <span className="rounded-full bg-[#EF4444]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#EF4444]">
                {t.common.spy}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export const RevealActions = memo(function RevealActions({
  isHost,
  onRestart,
  onLeave,
}: {
  isHost: boolean;
  onRestart: () => void;
  onLeave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      {isHost ? (
        <Button
          className="h-[52px] w-full gap-2 rounded-2xl bg-white text-lg font-semibold text-black hover:bg-white/90"
          onClick={onRestart}
        >
          <RotateCcw className="h-5 w-5" /> {t.game.playAgain}
        </Button>
      ) : (
        <p className="text-sm text-[#8E8E93]">{t.game.waitingForNewRound}</p>
      )}
      <button
        className="w-full py-3 text-center text-[13px] font-semibold text-[#EF4444] transition-colors hover:text-[#EF4444]/80"
        onClick={onLeave}
      >
        <LogOut className="mr-1 inline h-4 w-4" /> {t.game.leaveRoom}
      </button>
    </div>
  );
});
