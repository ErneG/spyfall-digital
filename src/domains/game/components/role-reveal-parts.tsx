"use client";

import { Eye, Shield, MapPin, ChevronRight, Check } from "lucide-react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import type { PeekRole } from "@/domains/game/hooks";

export const HandoffScreen = memo(function HandoffScreen({
  playerName,
  isFirst,
  onReady,
}: {
  playerName: string;
  isFirst: boolean;
  onReady: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="space-y-6 pt-8 pb-8 text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            {isFirst ? t.passAndPlay.startingWith : t.passAndPlay.handDeviceTo}
          </p>
          <p className="text-3xl font-bold">{playerName}</p>
        </div>
        <Button size="lg" className="h-14 w-full gap-2 text-lg" onClick={onReady}>
          {t.passAndPlay.imReady} {playerName} <ChevronRight className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
});

export const ReadyScreen = memo(function ReadyScreen({
  playerName,
  isLoading,
  hasError,
  onReveal,
}: {
  playerName: string;
  isLoading: boolean;
  hasError: boolean;
  onReveal: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="space-y-6 pt-8 pb-8 text-center">
        <Eye className="text-muted-foreground mx-auto h-12 w-12" />
        <div className="space-y-2">
          <p className="text-lg font-semibold">{playerName}</p>
          <p className="text-muted-foreground">{t.passAndPlay.tapToReveal}</p>
        </div>
        {hasError && <p className="text-destructive text-sm">{t.passAndPlay.fetchError}</p>}
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-full text-lg"
          onClick={onReveal}
          disabled={isLoading}
        >
          {isLoading && t.common.loading}
          {!isLoading && hasError && t.passAndPlay.retry}
          {!isLoading && !hasError && t.passAndPlay.revealMyRole}
        </Button>
      </CardContent>
    </Card>
  );
});

export const RevealedScreen = memo(function RevealedScreen({
  role,
  isLast,
  onNext,
}: {
  role: PeekRole;
  isLast: boolean;
  onNext: () => void;
}) {
  const { t, translateLocation, translateRole } = useTranslation();
  return (
    <Card>
      <CardContent className="space-y-6 pt-8 pb-8 text-center">
        {role.isSpy ? (
          <div className="space-y-3">
            <Shield className="text-primary mx-auto h-12 w-12" />
            <p className="text-2xl font-bold">{t.game.youAreTheSpy}</p>
            <p className="text-muted-foreground text-sm">{t.game.spyHint}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Shield className="text-primary mx-auto h-12 w-12" />
            <div className="flex items-center justify-center gap-2">
              <MapPin className="text-muted-foreground h-5 w-5" />
              <p className="text-2xl font-bold">
                {role.location ? translateLocation(role.location) : role.location}
              </p>
            </div>
            <p className="text-muted-foreground">
              {t.game.yourRole}{" "}
              <span className="text-foreground font-semibold">
                {role.myRole ? translateRole(role.myRole) : role.myRole}
              </span>
            </p>
          </div>
        )}
        <Button size="lg" className="h-14 w-full gap-2 text-lg" onClick={onNext}>
          {isLast ? (
            <>
              {t.passAndPlay.gotIt} <Check className="h-5 w-5" />
            </>
          ) : (
            <>
              {t.passAndPlay.gotItNext} <ChevronRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
});

export const AllReadyScreen = memo(function AllReadyScreen({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="space-y-6 pt-8 pb-8 text-center">
        <Check className="text-primary mx-auto h-12 w-12" />
        <div className="space-y-2">
          <p className="text-2xl font-bold">{t.passAndPlay.everyonesReady}</p>
          <p className="text-muted-foreground">{t.passAndPlay.allPlayersReady}</p>
        </div>
        <Button size="lg" className="h-14 w-full text-lg" onClick={onStart}>
          {t.passAndPlay.startPlaying}
        </Button>
      </CardContent>
    </Card>
  );
});
