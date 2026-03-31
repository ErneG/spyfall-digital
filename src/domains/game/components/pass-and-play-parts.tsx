"use client";

import { Eye, EyeOff, Shield, MapPin, Hand, ChevronRight } from "lucide-react";
import { memo, useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import type { PeekRole } from "@/domains/game/hooks";

export type { PeekRole };

// ─── Peek sub-components ──────────────────────────────────

const PeekPlayerButton = memo(function PeekPlayerButton({
  player,
  onSelect,
}: {
  player: { id: string; name: string };
  onSelect: (player: { id: string; name: string }) => void;
}) {
  const handleClick = useCallback(() => onSelect(player), [onSelect, player]);
  return (
    <Button variant="outline" className="w-full justify-start" onClick={handleClick}>
      {player.name}
    </Button>
  );
});

export const PeekPlayerPicker = memo(function PeekPlayerPicker({
  players,
  onSelectPlayer,
  onBack,
  title,
  subtitle,
  error,
}: {
  players: Array<{ id: string; name: string }>;
  onSelectPlayer: (player: { id: string; name: string }) => void;
  onBack: () => void;
  title?: string;
  subtitle?: string;
  error?: string | null;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-1 text-center">
          <p className="font-semibold">{title ?? t.passAndPlay.whoAreYou}</p>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
        {error && <p className="text-destructive text-center text-sm">{error}</p>}
        <div className="space-y-2">
          {players.map((p) => (
            <PeekPlayerButton key={p.id} player={p} onSelect={onSelectPlayer} />
          ))}
        </div>
        <Button variant="ghost" className="w-full" onClick={onBack}>
          {t.passAndPlay.backToGame}
        </Button>
      </CardContent>
    </Card>
  );
});

export const PeekRevealCard = memo(function PeekRevealCard({
  playerName,
  role,
  isRevealed,
  isLoading,
  hasError,
  onReveal,
  onHide,
  onBack,
}: {
  playerName: string;
  role: PeekRole | null;
  isRevealed: boolean;
  isLoading: boolean;
  hasError?: boolean;
  onReveal: () => void;
  onHide: () => void;
  onBack: () => void;
}) {
  const { t, translateLocation, translateRole } = useTranslation();
  if (!isRevealed || !role) {
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
  }

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

// ─── Voting carousel sub-components ───────────────────────

export const VoteHandoff = memo(function VoteHandoff({
  playerName,
  onReady,
  onCancel,
}: {
  playerName: string;
  onReady: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="space-y-6 pt-8 pb-8 text-center">
        <Hand className="text-muted-foreground mx-auto h-12 w-12" />
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">{t.passAndPlay.handDeviceTo}</p>
          <p className="text-3xl font-bold">{playerName}</p>
        </div>
        <Button size="lg" className="h-14 w-full gap-2 text-lg" onClick={onReady}>
          {t.passAndPlay.imReady} {playerName} <ChevronRight className="h-5 w-5" />
        </Button>
        {onCancel && (
          <Button variant="ghost" className="text-muted-foreground w-full" onClick={onCancel}>
            {t.passAndPlay.cancelVoting}
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

const VoteCandidateButton = memo(function VoteCandidateButton({
  player,
  isVoting,
  onVote,
}: {
  player: { id: string; name: string };
  isVoting: boolean;
  onVote: (suspectId: string) => void;
}) {
  const handleClick = useCallback(() => onVote(player.id), [onVote, player.id]);
  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleClick}
      disabled={isVoting}
    >
      {player.name}
    </Button>
  );
});

export const VotePicker = memo(function VotePicker({
  voterName,
  candidates,
  isVoting,
  onVote,
}: {
  voterName: string;
  candidates: Array<{ id: string; name: string }>;
  isVoting: boolean;
  onVote: (suspectId: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-1 text-center">
          <p className="text-lg font-semibold">{voterName}</p>
          <p className="text-muted-foreground text-sm">{t.passAndPlay.whoDoYouThink}</p>
        </div>
        <div className="space-y-2">
          {candidates.map((p) => (
            <VoteCandidateButton key={p.id} player={p} isVoting={isVoting} onVote={onVote} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
