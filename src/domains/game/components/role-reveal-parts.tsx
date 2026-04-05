"use client";

import { Check, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { memo, useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

import { MiniCardStack, RoleCard } from "./role-card-parts";

import type { PeekRole } from "@/domains/game/hooks";

/* ── Handoff Screen ──────────────────────────────────── */

export const HandoffScreen = memo(function HandoffScreen({
  playerName,
  isFirst,
  remaining,
  onReady,
}: {
  playerName: string;
  isFirst: boolean;
  remaining: number;
  onReady: () => void;
}) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pt-8 text-center"
    >
      <MiniCardStack count={remaining + 1} />
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

/* ── Card Screen (tap to flip + confirm) ─────────────── */

export const CardScreen = memo(function CardScreen({
  playerName,
  role,
  isFlipped,
  isLoading,
  hasFetchError,
  isLast,
  remaining,
  onFlip,
  onNext,
}: {
  playerName: string;
  role: PeekRole | null;
  isFlipped: boolean;
  isLoading: boolean;
  hasFetchError: boolean;
  isLast: boolean;
  remaining: number;
  onFlip: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();

  const handleFlip = useCallback(() => {
    void onFlip();
  }, [onFlip]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
      <RoleCard
        playerName={playerName}
        role={role}
        isFlipped={isFlipped}
        isLoading={isLoading}
        remaining={remaining}
        onFlip={handleFlip}
      />

      {hasFetchError && (
        <p className="text-spy-red text-sm">{t.passAndPlay.fetchError}</p>
      )}

      {isFlipped && role && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
      )}
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
