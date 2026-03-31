"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";

import { castVote } from "@/domains/game/actions";
import { useExpiryBeep, useGameActions } from "@/domains/game/components/game-view-parts";
import { useGameState, useTimer, fetchPlayerRole } from "@/domains/game/hooks";
import { useSession } from "@/shared/hooks/use-session";

// ─── Types ─────────────────────────────────────────────────

export type PassAndPlayPhase = "role-reveal" | "playing" | "voting" | "spy-guess";

interface PassAndPlayProps {
  gameId: string;
  hostPlayerId: string;
  allPlayers: Array<{ id: string; name: string }>;
  timeLimit: number;
  gameStartedAt: string | null;
  isTimerRunning: boolean;
}

// ─── Sub-hook: voting state ────────────────────────────────

function useVotingState(
  gameId: string,
  allPlayers: Array<{ id: string; name: string }>,
  setPhase: (p: PassAndPlayPhase) => void,
) {
  const [voteIndex, setVoteIndex] = useState(0);
  const [voteStep, setVoteStep] = useState<"handoff" | "pick">("handoff");
  const [isVoting, setIsVoting] = useState(false);

  const currentVoter = allPlayers[voteIndex];

  const voteCandidates = useMemo(
    () => allPlayers.filter((p) => p.id !== currentVoter.id),
    [allPlayers, currentVoter.id],
  );

  const handleStartVoting = useCallback(() => {
    setVoteIndex(0);
    setVoteStep("handoff");
    setPhase("voting");
  }, [setPhase]);

  const handleVoteReady = useCallback(() => {
    setVoteStep("pick");
  }, []);

  const handleCancelVoting = useCallback(() => {
    setVoteIndex(0);
    setVoteStep("handoff");
    setPhase("playing");
  }, [setPhase]);

  const submitVote = useCallback(
    async (suspectId: string) => {
      setIsVoting(true);
      await castVote({ gameId, voterId: currentVoter.id, suspectId });
      if (voteIndex < allPlayers.length - 1) {
        setVoteIndex((previous) => previous + 1);
        setVoteStep("handoff");
      } else {
        setPhase("playing");
      }
      setIsVoting(false);
    },
    [gameId, currentVoter.id, voteIndex, allPlayers.length, setPhase],
  );

  const handleCastVoteClick = useCallback(
    (suspectId: string) => {
      void submitVote(suspectId);
    },
    [submitVote],
  );

  const resetVoting = useCallback(() => {
    setVoteIndex(0);
    setVoteStep("handoff");
    setIsVoting(false);
  }, []);

  return {
    voteIndex,
    voteStep,
    isVoting,
    currentVoter,
    voteCandidates,
    handleStartVoting,
    handleVoteReady,
    handleCancelVoting,
    handleCastVoteClick,
    resetVoting,
  };
}

// ─── Sub-hook: spy guess state ─────────────────────────────

function useSpyGuess(gameId: string, setPhase: (p: PassAndPlayPhase) => void) {
  const [spyGuessPlayer, setSpyGuessPlayer] = useState<{ id: string; name: string } | null>(null);
  const [isVerifiedSpy, setIsVerifiedSpy] = useState(false);
  const [spyVerifyError, setSpyVerifyError] = useState<string | null>(null);

  const handleStartSpyGuess = useCallback(() => {
    setSpyGuessPlayer(null);
    setIsVerifiedSpy(false);
    setSpyVerifyError(null);
    setPhase("spy-guess");
  }, [setPhase]);

  const verifySpy = useCallback(
    async (player: { id: string; name: string }) => {
      setSpyGuessPlayer(player);
      setSpyVerifyError(null);
      setIsVerifiedSpy(false);
      const role = await fetchPlayerRole(gameId, player.id);
      if (role?.isSpy) {
        setIsVerifiedSpy(true);
      } else {
        setSpyVerifyError("Incorrect guess. Try again.");
        setSpyGuessPlayer(null);
      }
    },
    [gameId],
  );

  const handleSelectSpyPlayer = useCallback(
    (player: { id: string; name: string }) => {
      void verifySpy(player);
    },
    [verifySpy],
  );

  const handleSpyGuessBack = useCallback(() => {
    setSpyGuessPlayer(null);
    setIsVerifiedSpy(false);
    setSpyVerifyError(null);
    setPhase("playing");
  }, [setPhase]);

  const resetSpyGuess = useCallback(() => {
    setSpyGuessPlayer(null);
    setIsVerifiedSpy(false);
    setSpyVerifyError(null);
  }, []);

  return {
    spyGuessPlayer,
    isVerifiedSpy,
    spyVerifyError,
    handleStartSpyGuess,
    handleSelectSpyPlayer,
    handleSpyGuessBack,
    resetSpyGuess,
  };
}

// ─── Main hook ─────────────────────────────────────────────

const INITIAL_PHASE: PassAndPlayPhase = "role-reveal";
const REVEAL_PHASES = new Set(["REVEAL", "FINISHED"]);

export function usePassAndPlay({
  gameId,
  hostPlayerId,
  allPlayers,
  timeLimit,
  gameStartedAt,
  isTimerRunning: initialTimerRunning,
}: PassAndPlayProps) {
  const router = useRouter();
  const { clearSession } = useSession();
  const { game, isLoading } = useGameState(gameId, hostPlayerId);

  const isTimerRunning = game?.timerRunning ?? initialTimerRunning;
  const startedAt = game?.startedAt ?? gameStartedAt;
  const effectiveTimeLimit = game?.timeLimit ?? timeLimit;

  const { display, isExpired } = useTimer(startedAt, effectiveTimeLimit, isTimerRunning);
  const { timerMutation, endMutation, restartMutation } = useGameActions(gameId, hostPlayerId);

  useExpiryBeep(isExpired);

  const [phase, setPhase] = useState<PassAndPlayPhase>(INITIAL_PHASE);

  const voting = useVotingState(gameId, allPlayers, setPhase);
  const spyGuess = useSpyGuess(gameId, setPhase);

  const isServerInReveal = game ? REVEAL_PHASES.has(game.phase) : false;
  const shouldShowReveal = isServerInReveal && phase !== INITIAL_PHASE;

  const handleRoleRevealComplete = useCallback(() => {
    timerMutation.mutate(false);
    setPhase("playing");
  }, [timerMutation]);

  const onTimerToggle = useCallback(() => {
    timerMutation.mutate(isTimerRunning);
  }, [timerMutation, isTimerRunning]);

  const onEndGameClick = useCallback(() => {
    endMutation.mutate();
  }, [endMutation]);

  const handleLeave = useCallback(() => {
    clearSession();
    router.push("/");
  }, [clearSession, router]);

  const handlePlayAgain = useCallback(() => {
    setPhase(INITIAL_PHASE);
    voting.resetVoting();
    spyGuess.resetSpyGuess();
    restartMutation.mutate();
  }, [restartMutation, voting, spyGuess]);

  return {
    game,
    isLoading,
    phase,
    isTimerRunning,
    display,
    isExpired,
    shouldShowReveal,
    endMutation,
    // Handlers
    handleRoleRevealComplete,
    onTimerToggle,
    onEndGameClick,
    handleLeave,
    handlePlayAgain,
    // Sub-hook results
    voting,
    spyGuess,
  };
}
