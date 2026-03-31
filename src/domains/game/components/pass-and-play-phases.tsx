"use client";

import { memo } from "react";

import { LocationGrid } from "@/domains/game/components/location-grid";
import {
  PeekPlayerPicker,
  VoteHandoff,
  VotePicker,
} from "@/domains/game/components/pass-and-play-parts";
import { Button } from "@/shared/ui/button";

import type { usePassAndPlay } from "@/domains/game/components/use-pass-and-play";
import type { useTranslation } from "@/shared/i18n/context";

type HookState = ReturnType<typeof usePassAndPlay>;
type Translations = ReturnType<typeof useTranslation>["t"];

// ─── Spy Guess Phase ───────────────────────────────────────

interface SpyGuessPhaseProps {
  spyGuess: HookState["spyGuess"];
  game: HookState["game"];
  allPlayers: Array<{ id: string; name: string }>;
  gameId: string;
  t: Translations;
}

export const SpyGuessPhase = memo(function SpyGuessPhase({
  spyGuess,
  game,
  allPlayers,
  gameId,
  t,
}: SpyGuessPhaseProps) {
  const { spyGuessPlayer, isVerifiedSpy } = spyGuess;
  const isShowingGrid = Boolean(spyGuessPlayer) && isVerifiedSpy && Boolean(game);

  if (isShowingGrid && spyGuessPlayer && game) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <SpyGuessGrid
            spyGuessPlayer={spyGuessPlayer}
            game={game}
            gameId={gameId}
            onBack={spyGuess.handleSpyGuessBack}
            t={t}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <PeekPlayerPicker
          players={allPlayers}
          onSelectPlayer={spyGuess.handleSelectSpyPlayer}
          onBack={spyGuess.handleSpyGuessBack}
          title={t.passAndPlay.spyGuessTitle}
          subtitle={t.passAndPlay.spyGuessSubtitle}
          error={spyGuess.spyVerifyError}
        />
      </div>
    </main>
  );
});

const SpyGuessGrid = memo(function SpyGuessGrid({
  spyGuessPlayer,
  game,
  gameId,
  onBack,
  t,
}: {
  spyGuessPlayer: { id: string; name: string };
  game: NonNullable<HookState["game"]>;
  gameId: string;
  onBack: () => void;
  t: Translations;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          {spyGuessPlayer.name}, {t.passAndPlay.spyTapToGuess}
        </p>
      </div>
      <LocationGrid
        locations={game.allLocations}
        revealedLocation={null}
        prevLocationName={game.prevLocationName}
        gameId={gameId}
        playerId={spyGuessPlayer.id}
      />
      <Button variant="ghost" className="w-full" onClick={onBack}>
        {t.common.cancel}
      </Button>
    </div>
  );
});

// ─── Voting Phase ──────────────────────────────────────────

interface VotingPhaseProps {
  voting: HookState["voting"];
  allPlayers: Array<{ id: string; name: string }>;
  t: Translations;
}

export const VotingPhase = memo(function VotingPhase({ voting, allPlayers, t }: VotingPhaseProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-muted-foreground text-center text-sm">
          {t.passAndPlay.voteNofM} {voting.voteIndex + 1} of {allPlayers.length}
        </div>
        {voting.voteStep === "handoff" ? (
          <VoteHandoff
            playerName={voting.currentVoter.name}
            onReady={voting.handleVoteReady}
            onCancel={voting.handleCancelVoting}
          />
        ) : (
          <VotePicker
            voterName={voting.currentVoter.name}
            candidates={voting.voteCandidates}
            isVoting={voting.isVoting}
            onVote={voting.handleCastVoteClick}
          />
        )}
      </div>
    </main>
  );
});
