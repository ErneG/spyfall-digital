"use client";

import { ChevronRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { memo, useState } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

import { CardBack, FlippableRoleCard } from "./role-card-parts";

import type { PeekRole } from "@/domains/game/hooks";

/* ── Handoff Screen ──────────────────────────────────── */

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pt-8 text-center"
    >
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          {isFirst ? t.passAndPlay.startingWith : t.passAndPlay.handDeviceTo}
        </p>
        <p className="text-4xl font-bold">{playerName}</p>
      </div>
      <Button size="lg" className="h-14 w-full gap-2 text-lg" onClick={onReady}>
        {t.passAndPlay.imReady} {playerName} <ChevronRight className="h-5 w-5" />
      </Button>
    </motion.div>
  );
});

/* ── Ready Screen (card back preview) ────────────────── */

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
      <div className="perspective-1000 mx-auto w-full max-w-sm">
        <div className="relative h-[380px] w-full">
          <CardBack playerName={playerName} />
        </div>
      </div>
      {hasError && <p className="text-spy-red text-sm">{t.passAndPlay.fetchError}</p>}
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
    </motion.div>
  );
});

/* ── Revealed Screen (card flipped) ──────────────────── */

export const RevealedScreen = memo(function RevealedScreen({
  role,
  isLast,
  onNext,
}: {
  role: PeekRole;
  isLast: boolean;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const [isFlipped] = useState(true);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
      <FlippableRoleCard playerName="" role={role} isFlipped={isFlipped} onFlip={() => {}} />
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
    </motion.div>
  );
});

/* ── All Ready Screen ────────────────────────────────── */

export const AllReadyScreen = memo(function AllReadyScreen({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 pt-8 text-center"
    >
      <div className="bg-success/12 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <Check className="text-success h-8 w-8" />
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold">{t.passAndPlay.everyonesReady}</p>
        <p className="text-muted-foreground">{t.passAndPlay.allPlayersReady}</p>
      </div>
      <Button size="lg" className="h-14 w-full text-lg" onClick={onStart}>
        {t.passAndPlay.startPlaying}
      </Button>
    </motion.div>
  );
});
