"use client";

import { memo, useCallback } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Eye, EyeOff, AlertTriangle, Shield, MapPin,
  Hand, ChevronRight,
} from "lucide-react";
import type { PeekRole } from "@/domains/game/hooks";
import { useTranslation } from "@/shared/i18n/context";

export type { PeekRole };

// ─── Peek sub-components ──────────────────────────────────

const PeekPlayerButton = memo(function PeekPlayerButton({
  player, onSelect,
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
  players, onSelectPlayer, onBack, title, subtitle, error,
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
      <CardContent className="pt-6 space-y-4">
        <div className="text-center space-y-1">
          <p className="font-semibold">{title ?? t.passAndPlay.whoAreYou}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <div className="space-y-2">
          {players.map((p) => (
            <PeekPlayerButton key={p.id} player={p} onSelect={onSelectPlayer} />
          ))}
        </div>
        <Button variant="ghost" className="w-full" onClick={onBack}>{t.passAndPlay.backToGame}</Button>
      </CardContent>
    </Card>
  );
});

export const PeekRevealCard = memo(function PeekRevealCard({
  playerName, role, isRevealed, isLoading, hasError, onReveal, onHide, onBack,
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
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <Eye className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg font-semibold">{playerName}</p>
          {hasError && <p className="text-sm text-destructive">{t.passAndPlay.fetchError}</p>}
          <Button size="lg" variant="outline" className="w-full h-14 text-lg" onClick={onReveal} disabled={isLoading}>
            {isLoading && t.common.loading}
            {!isLoading && hasError && t.passAndPlay.retry}
            {!isLoading && !hasError && t.passAndPlay.revealMyRole}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onBack}>{t.common.back}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={role.isSpy ? "border-destructive/50 bg-destructive/5" : ""}>
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        {role.isSpy ? (
          <div className="space-y-3">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <p className="text-2xl font-bold text-destructive">{t.game.youAreTheSpy}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Shield className="h-12 w-12 mx-auto text-primary" />
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{role.location ? translateLocation(role.location) : role.location}</p>
            </div>
            <p className="text-muted-foreground">
              {t.game.yourRole} <span className="font-semibold text-foreground">{role.myRole ? translateRole(role.myRole) : role.myRole}</span>
            </p>
          </div>
        )}
        <Button size="lg" className="w-full h-14 text-lg gap-2" onClick={onHide}>
          <EyeOff className="h-5 w-5" /> {t.passAndPlay.hide}
        </Button>
      </CardContent>
    </Card>
  );
});

// ─── Voting carousel sub-components ───────────────────────

export const VoteHandoff = memo(function VoteHandoff({
  playerName, onReady, onCancel,
}: { playerName: string; onReady: () => void; onCancel?: () => void }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        <Hand className="h-12 w-12 mx-auto text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t.passAndPlay.handDeviceTo}</p>
          <p className="text-3xl font-bold">{playerName}</p>
        </div>
        <Button size="lg" className="w-full h-14 text-lg gap-2" onClick={onReady}>
          {t.passAndPlay.imReady} {playerName} <ChevronRight className="h-5 w-5" />
        </Button>
        {onCancel && (
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onCancel}>
            {t.passAndPlay.cancelVoting}
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

const VoteCandidateButton = memo(function VoteCandidateButton({
  player, isVoting, onVote,
}: {
  player: { id: string; name: string };
  isVoting: boolean;
  onVote: (suspectId: string) => void;
}) {
  const handleClick = useCallback(() => onVote(player.id), [onVote, player.id]);
  return (
    <Button variant="outline" className="w-full justify-start" onClick={handleClick} disabled={isVoting}>
      {player.name}
    </Button>
  );
});

export const VotePicker = memo(function VotePicker({
  voterName, candidates, isVoting, onVote,
}: {
  voterName: string;
  candidates: Array<{ id: string; name: string }>;
  isVoting: boolean;
  onVote: (suspectId: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold">{voterName}</p>
          <p className="text-sm text-muted-foreground">{t.passAndPlay.whoDoYouThink}</p>
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
