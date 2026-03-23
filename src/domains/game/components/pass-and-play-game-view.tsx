"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { useGameState, useTimer, fetchPlayerRole, type PeekRole } from "@/domains/game/hooks";
import { useSession } from "@/shared/hooks/use-session";
import { LocationGrid } from "@/domains/game/components/location-grid";
import { RevealScreen } from "@/domains/game/components/reveal-screen";
import { RoleRevealCarousel } from "@/domains/game/components/role-reveal-carousel";
import {
  TimerSection,
  useExpiryBeep,
  useGameActions,
} from "@/domains/game/components/game-view-parts";
import { castVote } from "@/domains/game/actions";
import {
  PeekPlayerPicker,
  PeekRevealCard,
  VoteHandoff,
  VotePicker,
} from "@/domains/game/components/pass-and-play-parts";
import { Eye, AlertTriangle, Hand, LogOut, Crosshair } from "lucide-react";

const REVEAL_PHASES = new Set(["REVEAL", "FINISHED"]);

interface PassAndPlayGameViewProps {
  gameId: string;
  hostPlayerId: string;
  allPlayers: Array<{ id: string; name: string }>;
  roomCode: string;
  timeLimit: number;
  gameStartedAt: string | null;
  hideSpyCount: boolean;
  spyCount: number;
  isTimerRunning: boolean;
}

export function PassAndPlayGameView({
  gameId, hostPlayerId, allPlayers, roomCode: _roomCode, timeLimit,
  gameStartedAt, hideSpyCount, spyCount, isTimerRunning: initialTimerRunning,
}: PassAndPlayGameViewProps) {
  const router = useRouter();
  const { clearSession } = useSession();
  const { game, isLoading } = useGameState(gameId, hostPlayerId);
  const isTimerRunning = game?.timerRunning ?? initialTimerRunning;
  const startedAt = game?.startedAt ?? gameStartedAt;
  const effectiveTimeLimit = game?.timeLimit ?? timeLimit;
  const { display, isExpired } = useTimer(startedAt, effectiveTimeLimit, isTimerRunning);
  const { timerMutation, endMutation, restartMutation } = useGameActions(gameId, hostPlayerId);

  useExpiryBeep(isExpired);

  const [phase, setPhase] = useState<"role-reveal" | "playing" | "peek" | "voting" | "spy-guess">("role-reveal");

  // Peek state
  const [peekPlayer, setPeekPlayer] = useState<{ id: string; name: string } | null>(null);
  const [peekRole, setPeekRole] = useState<PeekRole | null>(null);
  const [isPeekRevealed, setIsPeekRevealed] = useState(false);
  const [isPeekLoading, setIsPeekLoading] = useState(false);
  const [hasPeekFetchError, setPeekFetchError] = useState(false);

  // Voting state
  const [voteIndex, setVoteIndex] = useState(0);
  const [voteStep, setVoteStep] = useState<"handoff" | "pick">("handoff");
  const [isVoting, setIsVoting] = useState(false);

  // Spy guess state
  const [spyGuessPlayer, setSpyGuessPlayer] = useState<{ id: string; name: string } | null>(null);
  const [isVerifiedSpy, setIsVerifiedSpy] = useState(false);
  const [spyVerifyError, setSpyVerifyError] = useState<string | null>(null);

  // Server phase takes priority over client phase (except during role-reveal)
  const isServerInReveal = game ? REVEAL_PHASES.has(game.phase) : false;
  const shouldShowReveal = isServerInReveal && phase !== "role-reveal";

  const handleRoleRevealComplete = useCallback(() => {
    timerMutation.mutate(false);
    setPhase("playing");
  }, [timerMutation]);

  const onTimerToggle = useCallback(() => {
    timerMutation.mutate(isTimerRunning);
  }, [timerMutation, isTimerRunning]);

  const handleStartVoting = useCallback(() => {
    setVoteIndex(0);
    setVoteStep("handoff");
    setPhase("voting");
  }, []);

  const onEndGameClick = useCallback(() => { endMutation.mutate(); }, [endMutation]);

  const handlePeek = useCallback(() => {
    setPeekPlayer(null);
    setPeekRole(null);
    setIsPeekRevealed(false);
    setPhase("peek");
  }, []);

  const handleLeave = useCallback(() => {
    clearSession();
    router.push("/");
  }, [clearSession, router]);

  const handleSelectPeekPlayer = useCallback((player: { id: string; name: string }) => {
    setPeekPlayer(player);
    setPeekRole(null);
    setIsPeekRevealed(false);
    setPeekFetchError(false);
  }, []);

  const peekReveal = useCallback(async () => {
    if (!peekPlayer) return;
    setIsPeekLoading(true);
    setPeekFetchError(false);
    const role = await fetchPlayerRole(gameId, peekPlayer.id);
    if (role) {
      setPeekRole(role);
      setIsPeekRevealed(true);
    } else {
      setPeekFetchError(true);
    }
    setIsPeekLoading(false);
  }, [gameId, peekPlayer]);

  const handlePeekRevealClick = useCallback(() => { void peekReveal(); }, [peekReveal]);

  const handlePeekHide = useCallback(() => {
    setIsPeekRevealed(false);
    setPeekRole(null);
    setPeekPlayer(null);
  }, []);

  const handlePeekBack = useCallback(() => {
    setPeekPlayer(null);
    setPeekRole(null);
    setIsPeekRevealed(false);
    setPhase("playing");
  }, []);

  // ─── Spy guess handlers ──────────────────────────────────

  const handleStartSpyGuess = useCallback(() => {
    setSpyGuessPlayer(null);
    setIsVerifiedSpy(false);
    setSpyVerifyError(null);
    setPhase("spy-guess");
  }, []);

  const verifySpy = useCallback(async (player: { id: string; name: string }) => {
    setSpyGuessPlayer(player);
    setSpyVerifyError(null);
    setIsVerifiedSpy(false);
    const role = await fetchPlayerRole(gameId, player.id);
    if (role?.isSpy) {
      setIsVerifiedSpy(true);
    } else {
      setSpyVerifyError(`${player.name} is not the spy.`);
      setSpyGuessPlayer(null);
    }
  }, [gameId]);

  const handleSelectSpyPlayer = useCallback((player: { id: string; name: string }) => {
    void verifySpy(player);
  }, [verifySpy]);

  const handleSpyGuessBack = useCallback(() => {
    setSpyGuessPlayer(null);
    setIsVerifiedSpy(false);
    setSpyVerifyError(null);
    setPhase("playing");
  }, []);

  const currentVoter = allPlayers[voteIndex];

  const voteCandidates = useMemo(
    () => allPlayers.filter((p) => p.id !== currentVoter.id),
    [allPlayers, currentVoter.id],
  );

  const handleVoteReady = useCallback(() => {
    setVoteStep("pick");
  }, []);

  const handleCancelVoting = useCallback(() => {
    setVoteIndex(0);
    setVoteStep("handoff");
    setPhase("playing");
  }, []);

  const submitVote = useCallback(async (suspectId: string) => {
    setIsVoting(true);
    await castVote({ gameId, voterId: currentVoter.id, suspectId });
    if (voteIndex < allPlayers.length - 1) {
      setVoteIndex((previous) => previous + 1);
      setVoteStep("handoff");
    } else {
      setPhase("playing");
    }
    setIsVoting(false);
  }, [gameId, currentVoter.id, voteIndex, allPlayers.length]);

  const handleCastVoteClick = useCallback((suspectId: string) => {
    void submitVote(suspectId);
  }, [submitVote]);

  const handlePlayAgain = useCallback(() => {
    // Reset all client state for new round
    setPhase("role-reveal");
    setPeekPlayer(null);
    setPeekRole(null);
    setIsPeekRevealed(false);
    setIsPeekLoading(false);
    setPeekFetchError(false);
    setVoteIndex(0);
    setVoteStep("handoff");
    setIsVoting(false);
    setSpyGuessPlayer(null);
    setIsVerifiedSpy(false);
    setSpyVerifyError(null);
    restartMutation.mutate();
  }, [restartMutation]);

  const spyBadges = useMemo(
    () => hideSpyCount ? null : Array.from({ length: spyCount }, (_, i) => (
      <Badge key={i} variant="destructive" className="text-xs"><AlertTriangle className="mr-1 h-3 w-3" /> Spy</Badge>
    )),
    [hideSpyCount, spyCount],
  );

  // (isRevealPhase replaced by shouldShowReveal computed above)

  if (!game && !isLoading && phase !== "role-reveal") {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p className="text-destructive">Failed to load game</p>
      </main>
    );
  }

  if (phase === "role-reveal") {
    return <RoleRevealCarousel gameId={gameId} players={allPlayers} onComplete={handleRoleRevealComplete} />;
  }

  if (shouldShowReveal && game) {
    return <RevealScreen game={game} playerId={hostPlayerId} isHost onRestart={handlePlayAgain} onLeave={handleLeave} />;
  }

  if (phase === "peek") {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          {!peekPlayer ? (
            <PeekPlayerPicker players={allPlayers} onSelectPlayer={handleSelectPeekPlayer} onBack={handlePeekBack} />
          ) : (
            <PeekRevealCard
              playerName={peekPlayer.name} role={peekRole} isRevealed={isPeekRevealed}
              isLoading={isPeekLoading} hasError={hasPeekFetchError}
              onReveal={handlePeekRevealClick} onHide={handlePeekHide} onBack={handlePeekBack}
            />
          )}
        </div>
      </main>
    );
  }

  if (phase === "spy-guess") {
    const isShowingGrid = spyGuessPlayer && isVerifiedSpy && game;
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          {isShowingGrid ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{spyGuessPlayer.name}, tap a location to guess</p>
              </div>
              <LocationGrid
                locations={game.allLocations}
                revealedLocation={null}
                prevLocationName={game.prevLocationName}
                gameId={gameId}
                playerId={spyGuessPlayer.id}
              />
              <Button variant="ghost" className="w-full" onClick={handleSpyGuessBack}>Cancel</Button>
            </div>
          ) : (
            <PeekPlayerPicker
              players={allPlayers}
              onSelectPlayer={handleSelectSpyPlayer}
              onBack={handleSpyGuessBack}
              title="Spy: Guess the Location"
              subtitle="Select your name to verify you're the spy."
              error={spyVerifyError}
            />
          )}
        </div>
      </main>
    );
  }

  if (phase === "voting") {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Vote {voteIndex + 1} of {allPlayers.length}
          </div>
          {voteStep === "handoff" ? (
            <VoteHandoff playerName={currentVoter.name} onReady={handleVoteReady} onCancel={handleCancelVoting} />
          ) : (
            <VotePicker voterName={currentVoter.name} candidates={voteCandidates} isVoting={isVoting} onVote={handleCastVoteClick} />
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center p-4 pb-24">
      <div className="w-full max-w-md space-y-4">
        <TimerSection display={display} isExpired={isExpired} isTimerRunning={isTimerRunning} isHost onToggle={onTimerToggle} />
        {spyBadges && <div className="flex justify-center gap-1">{spyBadges}</div>}

        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-2">Players ({allPlayers.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {allPlayers.map((p) => (
                <Badge key={p.id} variant="secondary">{p.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full h-12 gap-2" onClick={handlePeek}>
          <Eye className="h-4 w-4" /> Peek at My Role
        </Button>

        {game && (
          <LocationGrid
            locations={game.allLocations}
            revealedLocation={game.location}
            prevLocationName={game.prevLocationName}
          />
        )}

        <Separator />

        <Button variant="outline" className="w-full h-12 gap-2 border-destructive/50 text-destructive" onClick={handleStartSpyGuess}>
          <Crosshair className="h-4 w-4" /> Spy: Guess Location
        </Button>

        <div className="flex gap-2">
          <Button variant="destructive" className="flex-1" onClick={onEndGameClick} disabled={endMutation.isPending}>
            {endMutation.isPending ? "Ending..." : "End Game"}
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={handleStartVoting}>
            <Hand className="h-4 w-4" /> Vote
          </Button>
        </div>

        <Button variant="ghost" className="w-full text-muted-foreground gap-2" onClick={handleLeave}>
          <LogOut className="h-4 w-4" /> Leave Game
        </Button>
      </div>
    </main>
  );
}
