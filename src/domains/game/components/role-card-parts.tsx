"use client";

import { AlertTriangle, Eye, Shield, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";

import type { PeekRole } from "@/domains/game/hooks";

/* ── Card Back (classified design) ───────────────────── */

export const CardBack = memo(function CardBack({ playerName }: { playerName: string }) {
  return (
    <div className="bg-surface-1 flex h-full flex-col items-center justify-center gap-6 rounded-2xl border border-white/5 p-8 backface-hidden">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="bg-muted-foreground/20 absolute h-full w-px" />
        <div className="bg-muted-foreground/20 absolute h-px w-full" />
        <div className="border-muted-foreground/20 absolute h-16 w-16 rounded-full border" />
        <div className="border-muted-foreground/30 absolute h-8 w-8 rounded-full border" />
        <Eye className="text-muted-foreground relative h-6 w-6" />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-2xl font-bold">{playerName}</p>
        <p className="text-muted-foreground text-sm">Tap to reveal your role</p>
      </div>
      <p className="text-muted-foreground/40 text-[10px] font-semibold tracking-[0.12em] uppercase">
        classified
      </p>
    </div>
  );
});

/* ── Card Front (spy) ────────────────────────────────── */

export const CardFrontSpy = memo(function CardFrontSpy() {
  const { t } = useTranslation();
  return (
    <div className="border-spy-red/30 bg-spy-red/8 flex h-full rotate-y-180 flex-col items-center justify-center gap-4 rounded-2xl border-2 p-8 backface-hidden">
      <div className="bg-spy-red/12 flex h-16 w-16 items-center justify-center rounded-full">
        <AlertTriangle className="text-spy-red h-8 w-8" />
      </div>
      <p className="text-spy-red text-3xl font-bold">{t.game.youAreTheSpy}</p>
      <p className="text-muted-foreground text-sm">{t.game.spyHint}</p>
    </div>
  );
});

/* ── Card Front (agent) ──────────────────────────────── */

export const CardFrontAgent = memo(function CardFrontAgent({
  location,
  myRole,
}: {
  location: string | null;
  myRole: string | null;
}) {
  const { t, translateLocation, translateRole } = useTranslation();
  return (
    <div className="border-spy-purple/30 bg-spy-purple/8 flex h-full rotate-y-180 flex-col items-center justify-center gap-4 rounded-2xl border-2 p-8 backface-hidden">
      <div className="bg-spy-purple/12 flex h-16 w-16 items-center justify-center rounded-full">
        <Shield className="text-spy-purple h-8 w-8" />
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="text-muted-foreground/60 h-5 w-5" />
        <p className="text-2xl font-bold">{location ? translateLocation(location) : location}</p>
      </div>
      <p className="text-muted-foreground">
        {t.game.yourRole}{" "}
        <span className="font-semibold text-white">{myRole ? translateRole(myRole) : myRole}</span>
      </p>
    </div>
  );
});

/* ── Flippable Role Card ─────────────────────────────── */

export const FlippableRoleCard = memo(function FlippableRoleCard({
  playerName,
  role,
  isFlipped,
  onFlip,
}: {
  playerName: string;
  role: PeekRole | null;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div className="perspective-1000 mx-auto w-full max-w-sm">
      <motion.div
        className="preserve-3d relative h-[380px] w-full cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onClick={onFlip}
      >
        <div className="absolute inset-0">
          <CardBack playerName={playerName} />
        </div>
        <div className="absolute inset-0">
          {role?.isSpy ? (
            <CardFrontSpy />
          ) : (
            <CardFrontAgent location={role?.location ?? null} myRole={role?.myRole ?? null} />
          )}
        </div>
      </motion.div>
    </div>
  );
});
