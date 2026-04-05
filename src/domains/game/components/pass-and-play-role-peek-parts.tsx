"use client";

import { ArrowLeft, Eye } from "lucide-react";
import { memo, useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import type { PeekRole } from "@/domains/game/hooks";

type Translations = ReturnType<typeof useTranslation>["t"];

// ─── Player picker ─────────────────────────────────────────

export const RolePeekPicker = memo(function RolePeekPicker({
  allPlayers,
  isLoading,
  onSelect,
  onBack,
  t,
}: {
  allPlayers: Array<{ id: string; name: string }>;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onBack: () => void;
  t: Translations;
}) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2 text-center">
          <Eye className="text-muted-foreground mx-auto h-8 w-8" />
          <h2 className="text-lg font-semibold">{t.passAndPlay.peekTitle}</h2>
          <p className="text-muted-foreground text-sm">{t.passAndPlay.peekSubtitle}</p>
        </div>
        {isLoading && (
          <p className="text-muted-foreground text-center text-sm">{t.common.loading}</p>
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
        <Button variant="ghost" className="w-full gap-2" onClick={onBack}>
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
    <Card>
      <CardContent className="space-y-3 py-6">
        <p className="text-muted-foreground text-sm">{playerName}</p>
        {role.isSpy ? (
          <p className="text-destructive text-xl font-bold">{t.game.youAreTheSpy}</p>
        ) : (
          <>
            <p className="text-xl font-bold">
              {role.location ? translateLocation(role.location) : ""}
            </p>
            <p className="text-muted-foreground text-sm">
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
      className={`cursor-pointer transition-colors ${disabled ? "opacity-50" : "hover:bg-accent"}`}
      onClick={disabled ? undefined : handleClick}
    >
      <CardContent className="flex items-center justify-between py-3">
        <span className="font-medium">{player.name}</span>
        <Eye className="text-muted-foreground h-4 w-4" />
      </CardContent>
    </Card>
  );
});
