"use client";

import { ArrowLeft, Eye } from "lucide-react";
import { memo, useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import type { PeekRole } from "@/domains/game/hooks";

type Translations = ReturnType<typeof useTranslation>["t"];

export const RolePeekHandoff = memo(function RolePeekHandoff({
  onContinue,
  onBack,
  t,
}: {
  onContinue: () => void;
  onBack: () => void;
  t: Translations;
}) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#eef3f8] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(255,255,255,0.58)_32%,transparent_54%),radial-gradient(circle_at_82%_18%,rgba(191,219,254,0.52),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.4),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative w-full max-w-md space-y-4 rounded-[32px] border border-white/80 bg-white/72 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl">
        <div className="space-y-2 text-center">
          <Eye className="mx-auto h-8 w-8 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-950">{t.passAndPlay.peekTitle}</h2>
          <p className="text-sm text-slate-500">{t.passAndPlay.peekSubtitle}</p>
        </div>
        <Button className="w-full" onClick={onContinue}>
          {t.passAndPlay.choosePlayer}
        </Button>
        <Button variant="ghost" className="w-full gap-2 text-slate-600" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> {t.common.back}
        </Button>
      </div>
    </main>
  );
});

// ─── Player picker ─────────────────────────────────────────

export const RolePeekPicker = memo(function RolePeekPicker({
  allPlayers,
  isLoading,
  hasFetchError,
  onSelect,
  onBack,
  t,
}: {
  allPlayers: Array<{ id: string; name: string }>;
  isLoading: boolean;
  hasFetchError: boolean;
  onSelect: (id: string) => void;
  onBack: () => void;
  t: Translations;
}) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#eef3f8] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(255,255,255,0.58)_32%,transparent_54%),radial-gradient(circle_at_82%_18%,rgba(191,219,254,0.52),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.4),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative w-full max-w-md space-y-4 rounded-[32px] border border-white/80 bg-white/72 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl">
        <div className="space-y-2 text-center">
          <Eye className="mx-auto h-8 w-8 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-950">{t.passAndPlay.choosePlayer}</h2>
          <p className="text-sm text-slate-500">{t.passAndPlay.peekSubtitle}</p>
        </div>
        {isLoading && <p className="text-center text-sm text-slate-500">{t.common.loading}</p>}
        {hasFetchError && (
          <p className="text-destructive text-center text-sm">{t.passAndPlay.fetchError}</p>
        )}
        <div className="space-y-2">
          {allPlayers.map((player) => (
            <PeekPlayerButton
              key={player.id}
              player={player}
              onSelect={onSelect}
              disabled={isLoading}
            />
          ))}
        </div>
        <Button variant="ghost" className="w-full gap-2 text-slate-600" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> {t.common.back}
        </Button>
      </div>
    </main>
  );
});

// ─── Role reveal card ──────────────────────────────────────

export const RolePeekReveal = memo(function RolePeekReveal({
  playerName,
  role,
  onDismiss,
  t,
}: {
  playerName: string;
  role: PeekRole;
  onDismiss: () => void;
  t: Translations;
}) {
  const { translateLocation, translateRole } = useTranslation();

  return (
    <Card className="border-white/80 bg-white/76 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl">
      <CardContent className="space-y-3 py-6">
        <p className="text-sm text-slate-500">{playerName}</p>
        {role.isSpy ? (
          <p className="text-destructive text-xl font-bold">{t.game.youAreTheSpy}</p>
        ) : (
          <>
            <p className="text-xl font-bold text-slate-950">
              {role.location ? translateLocation(role.location) : ""}
            </p>
            <p className="text-sm text-slate-500">
              {t.game.yourRole} {translateRole(role.myRole)}
            </p>
          </>
        )}
        <Button className="mt-4 w-full" onClick={onDismiss}>
          {t.passAndPlay.gotIt}
        </Button>
      </CardContent>
    </Card>
  );
});

// ─── Player button ─────────────────────────────────────────

const PeekPlayerButton = memo(function PeekPlayerButton({
  player,
  onSelect,
  disabled,
}: {
  player: { id: string; name: string };
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  const handleClick = useCallback(() => {
    void onSelect(player.id);
  }, [onSelect, player.id]);

  return (
    <Card
      className={`border-white/80 bg-white/76 ${disabled ? "opacity-50" : "hover:bg-slate-50"}`}
    >
      <CardContent className="flex items-center justify-between py-3">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          disabled={disabled}
          onClick={handleClick}
        >
          <span className="font-medium text-slate-950">{player.name}</span>
          <Eye className="h-4 w-4 text-slate-400" />
        </button>
      </CardContent>
    </Card>
  );
});
