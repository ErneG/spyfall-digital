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
      className="space-y-8 rounded-[32px] border border-white/80 bg-white/72 p-6 pt-8 text-center shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl"
    >
      <MiniCardStack count={remaining + 1} />
      <div className="space-y-2">
        <p className="text-sm text-slate-500">
          {isFirst ? t.passAndPlay.startingWith : t.passAndPlay.handDeviceTo}
        </p>
        <p className="text-4xl font-bold text-slate-950">{playerName}</p>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 rounded-[32px] border border-white/80 bg-white/72 p-6 text-center shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl"
    >
      <RoleCard
        playerName={playerName}
        role={role}
        isFlipped={isFlipped}
        isLoading={isLoading}
        remaining={remaining}
        onFlip={handleFlip}
      />

      {hasFetchError && (
        <div className="space-y-3">
          <p className="text-spy-red text-sm">{t.passAndPlay.fetchError}</p>
          {!isFlipped && (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl border-white/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              onClick={handleFlip}
            >
              {t.passAndPlay.retry}
            </Button>
          )}
        </div>
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
      className="space-y-6 rounded-[32px] border border-white/80 bg-white/72 p-6 pt-8 text-center shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <Check className="h-8 w-8 text-emerald-600" />
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-slate-950">{t.passAndPlay.everyonesReady}</p>
        <p className="text-slate-500">{t.passAndPlay.allPlayersReady}</p>
      </div>
      <Button size="lg" className="h-14 w-full text-lg" onClick={onStart}>
        {t.passAndPlay.startPlaying}
      </Button>
    </motion.div>
  );
});
