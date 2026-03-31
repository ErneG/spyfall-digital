"use client";

import { Eye, Shield, MapPin, ChevronRight, Check } from "lucide-react";
import { useState, useCallback, memo } from "react";

import { fetchPlayerRole, type PeekRole } from "@/domains/game/hooks";
import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

type RevealStep = "handoff" | "ready" | "revealed";

const HandoffScreen = memo(function HandoffScreen({
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

const ReadyScreen = memo(function ReadyScreen({
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

const RevealedScreen = memo(function RevealedScreen({
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

const AllReadyScreen = memo(function AllReadyScreen({ onStart }: { onStart: () => void }) {
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

export function RoleRevealCarousel({
  gameId,
  players,
  onComplete,
}: {
  gameId: string;
  players: Array<{ id: string; name: string }>;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const [playerIndex, setPlayerIndex] = useState(0);
  const [step, setStep] = useState<RevealStep>("handoff");
  const [role, setRole] = useState<PeekRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);
  const [isAllDone, setIsAllDone] = useState(false);

  const currentPlayer = players[playerIndex];
  const isLast = playerIndex === players.length - 1;

  const handleReady = useCallback(() => {
    setStep("ready");
  }, []);

  const revealRole = useCallback(async () => {
    setIsLoading(true);
    setHasFetchError(false);
    const fetched = await fetchPlayerRole(gameId, currentPlayer.id);
    if (fetched) {
      setRole(fetched);
      setStep("revealed");
    } else {
      setHasFetchError(true);
    }
    setIsLoading(false);
  }, [gameId, currentPlayer.id]);

  const handleRevealClick = useCallback(() => {
    void revealRole();
  }, [revealRole]);

  const handleNext = useCallback(() => {
    if (isLast) {
      setIsAllDone(true);
    } else {
      setPlayerIndex((previous) => previous + 1);
      setStep("handoff");
      setRole(null);
    }
  }, [isLast]);

  if (isAllDone) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AllReadyScreen onStart={onComplete} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-muted-foreground text-center text-sm">
          {t.passAndPlay.playerNofM} {playerIndex + 1} of {players.length}
        </div>

        {step === "handoff" && (
          <HandoffScreen
            playerName={currentPlayer.name}
            isFirst={playerIndex === 0}
            onReady={handleReady}
          />
        )}

        {step === "ready" && (
          <ReadyScreen
            playerName={currentPlayer.name}
            isLoading={isLoading}
            hasError={hasFetchError}
            onReveal={handleRevealClick}
          />
        )}

        {step === "revealed" && role && (
          <RevealedScreen role={role} isLast={isLast} onNext={handleNext} />
        )}
      </div>
    </main>
  );
}
