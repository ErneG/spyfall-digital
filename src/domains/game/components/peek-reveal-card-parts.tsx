"use client";

import { Eye, EyeOff, Shield, MapPin } from "lucide-react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import type { PeekRole } from "@/domains/game/hooks";

export const PeekHidden = memo(function PeekHidden({
  playerName,
  isLoading,
  hasError,
  onReveal,
  onBack,
}: {
  playerName: string;
  isLoading: boolean;
  hasError?: boolean;
  onReveal: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="space-y-6 pt-8 pb-8 text-center">
        <Eye className="text-muted-foreground mx-auto h-12 w-12" />
        <p className="text-lg font-semibold">{playerName}</p>
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
        <Button variant="ghost" className="w-full" onClick={onBack}>
          {t.common.back}
        </Button>
      </CardContent>
    </Card>
  );
});

export const PeekShown = memo(function PeekShown({
  role,
  onHide,
}: {
  role: PeekRole;
  onHide: () => void;
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
        <Button size="lg" className="h-14 w-full gap-2 text-lg" onClick={onHide}>
          <EyeOff className="h-5 w-5" /> {t.passAndPlay.hide}
        </Button>
      </CardContent>
    </Card>
  );
});
