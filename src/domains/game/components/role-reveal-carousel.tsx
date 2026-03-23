"use client";

import { useState, useCallback, memo } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Eye, AlertTriangle, Shield, MapPin, ChevronRight, Check } from "lucide-react";
import { fetchPlayerRole, type PeekRole } from "@/domains/game/hooks";

type RevealStep = "handoff" | "ready" | "revealed";

const HandoffScreen = memo(function HandoffScreen({
  playerName, isFirst, onReady,
}: { playerName: string; isFirst: boolean; onReady: () => void }) {
  return (
    <Card>
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isFirst ? "Starting with" : "Hand the device to"}
          </p>
          <p className="text-3xl font-bold">{playerName}</p>
        </div>
        <Button size="lg" className="w-full h-14 text-lg gap-2" onClick={onReady}>
          I&apos;m {playerName} <ChevronRight className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
});

const ReadyScreen = memo(function ReadyScreen({
  playerName, isLoading, hasError, onReveal,
}: { playerName: string; isLoading: boolean; hasError: boolean; onReveal: () => void }) {
  return (
    <Card>
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        <Eye className="h-12 w-12 mx-auto text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-lg font-semibold">{playerName}</p>
          <p className="text-muted-foreground">Tap below to see your role</p>
        </div>
        {hasError && (
          <p className="text-sm text-destructive">Failed to load role. Tap to retry.</p>
        )}
        <Button
          size="lg"
          variant="outline"
          className="w-full h-14 text-lg"
          onClick={onReveal}
          disabled={isLoading}
        >
          {isLoading && "Loading..."}
          {!isLoading && hasError && "Retry"}
          {!isLoading && !hasError && "Reveal My Role"}
        </Button>
      </CardContent>
    </Card>
  );
});

const RevealedScreen = memo(function RevealedScreen({
  role, isLast, onNext,
}: { role: PeekRole; isLast: boolean; onNext: () => void }) {
  return (
    <Card className={role.isSpy ? "border-destructive/50 bg-destructive/5" : ""}>
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        {role.isSpy ? (
          <div className="space-y-3">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <p className="text-2xl font-bold text-destructive">You are the SPY</p>
            <p className="text-sm text-muted-foreground">
              Figure out the location from other players&apos; questions!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Shield className="h-12 w-12 mx-auto text-primary" />
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{role.location}</p>
            </div>
            <p className="text-muted-foreground">
              Your role: <span className="font-semibold text-foreground">{role.myRole}</span>
            </p>
          </div>
        )}
        <Button size="lg" className="w-full h-14 text-lg gap-2" onClick={onNext}>
          {isLast ? (
            <>Got it <Check className="h-5 w-5" /></>
          ) : (
            <>Got it, pass to next <ChevronRight className="h-5 w-5" /></>
          )}
        </Button>
      </CardContent>
    </Card>
  );
});

const AllReadyScreen = memo(function AllReadyScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card>
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        <Check className="h-12 w-12 mx-auto text-primary" />
        <div className="space-y-2">
          <p className="text-2xl font-bold">Everyone&apos;s ready!</p>
          <p className="text-muted-foreground">All players have seen their roles.</p>
        </div>
        <Button size="lg" className="w-full h-14 text-lg" onClick={onStart}>
          Start Playing
        </Button>
      </CardContent>
    </Card>
  );
});

export function RoleRevealCarousel({ gameId, players, onComplete }: { gameId: string; players: Array<{ id: string; name: string }>; onComplete: () => void }) {
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

  const handleRevealClick = useCallback(() => { void revealRole(); }, [revealRole]);

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
        <div className="text-center text-sm text-muted-foreground">
          Player {playerIndex + 1} of {players.length}
        </div>

        {step === "handoff" && (
          <HandoffScreen playerName={currentPlayer.name} isFirst={playerIndex === 0} onReady={handleReady} />
        )}

        {step === "ready" && (
          <ReadyScreen playerName={currentPlayer.name} isLoading={isLoading} hasError={hasFetchError} onReveal={handleRevealClick} />
        )}

        {step === "revealed" && role && (
          <RevealedScreen role={role} isLast={isLast} onNext={handleNext} />
        )}
      </div>
    </main>
  );
}
