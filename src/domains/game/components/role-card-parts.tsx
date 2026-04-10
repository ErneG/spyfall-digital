"use client";

import { AlertTriangle, Eye, MapPin, Shield } from "lucide-react";
import { motion } from "motion/react";
import { memo, useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";

import type { PeekRole } from "@/domains/game/hooks";

/* ── Decorative card stack behind the active card ───── */

const CardStack = memo(function CardStack({ remaining }: { remaining: number }) {
  if (remaining <= 0) {
    return null;
  }
  return (
    <>
      {remaining >= 2 && (
        <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-3 rounded-3xl border border-white/80 bg-white/60" />
      )}
      {remaining >= 1 && (
        <div className="absolute inset-0 translate-x-1 translate-y-1 rotate-1 rounded-3xl border border-white/80 bg-white/72" />
      )}
    </>
  );
});

/* ── Card face-down (classified) ────────────────────── */

const CardFaceDown = memo(function CardFaceDown({ playerName }: { playerName: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 rounded-3xl border border-white/85 bg-white/78 p-8 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur-xl">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute h-full w-px bg-slate-200" />
        <div className="absolute h-px w-full bg-slate-200" />
        <div className="absolute h-20 w-20 rounded-full border border-slate-200" />
        <div className="absolute h-10 w-10 rounded-full border border-slate-300" />
        <Eye className="relative h-8 w-8 text-slate-500" />
      </div>
      <div className="space-y-3 text-center">
        <p className="text-3xl font-bold text-slate-950">{playerName}</p>
        <p className="text-slate-500">{t.passAndPlay.tapToReveal}</p>
      </div>
      <p className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">classified</p>
    </div>
  );
});

/* ── Card face-up: Spy ──────────────────────────────── */

const CardFaceSpy = memo(function CardFaceSpy() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 rounded-3xl border-2 border-rose-200 bg-rose-50 p-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
        <AlertTriangle className="text-spy-red h-10 w-10" />
      </div>
      <p className="text-spy-red text-center text-4xl leading-tight font-extrabold">
        {t.game.youAreTheSpy}
      </p>
      <p className="text-center text-base text-slate-500">{t.game.spyHint}</p>
    </div>
  );
});

/* ── Card face-up: Agent ────────────────────────────── */

const CardFaceAgent = memo(function CardFaceAgent({
  location,
  myRole,
}: {
  location: string | null;
  myRole: string | null;
}) {
  const { t, translateLocation, translateRole } = useTranslation();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 rounded-3xl border-2 border-teal-200 bg-teal-50 p-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
        <Shield className="h-10 w-10 text-teal-700" />
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 shrink-0 text-slate-400" />
        <p className="text-center text-3xl font-extrabold text-slate-950">
          {location ? translateLocation(location) : location}
        </p>
      </div>
      <p className="text-center text-lg text-slate-500">
        {t.game.yourRole}{" "}
        <span className="font-bold text-slate-950">{myRole ? translateRole(myRole) : myRole}</span>
      </p>
    </div>
  );
});

/* ── Flippable role card with stacked deck visual ───── */

export const RoleCard = memo(function RoleCard({
  playerName,
  role,
  isFlipped,
  isLoading,
  remaining,
  onFlip,
}: {
  playerName: string;
  role: PeekRole | null;
  isFlipped: boolean;
  isLoading: boolean;
  remaining: number;
  onFlip: () => void;
}) {
  const handleClick = useCallback(() => {
    if (!isFlipped && !isLoading) {
      onFlip();
    }
  }, [isFlipped, isLoading, onFlip]);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <CardStack remaining={remaining} />
      <div className="perspective-1000 relative">
        <motion.button
          type="button"
          className="preserve-3d relative aspect-[5/7] w-full cursor-pointer border-0 bg-transparent p-0 text-left"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          disabled={isFlipped || isLoading}
          aria-busy={isLoading || undefined}
          onClick={handleClick}
        >
          {/* Back face */}
          <div aria-hidden={isFlipped} className="absolute inset-0 backface-hidden">
            <CardFaceDown playerName={playerName} />
          </div>
          {/* Front face (pre-rotated so it shows correctly when flipped) */}
          <div aria-hidden={!isFlipped} className="absolute inset-0 rotate-y-180 backface-hidden">
            {role?.isSpy ? (
              <CardFaceSpy />
            ) : (
              <CardFaceAgent location={role?.location ?? null} myRole={role?.myRole ?? null} />
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
});

/* ── Standalone face-down card (no flip, for loading) ─ */

export const StaticCardBack = memo(function StaticCardBack({
  playerName,
  remaining,
}: {
  playerName: string;
  remaining: number;
}) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <CardStack remaining={remaining} />
      <div className="relative aspect-[5/7] w-full">
        <CardFaceDown playerName={playerName} />
      </div>
    </div>
  );
});

/* ── Re-export for peek card usage elsewhere ────────── */

export { CardFaceDown, CardFaceSpy, CardFaceAgent };

/* ── Small inline card for handoff screen ───────────── */

export const MiniCardStack = memo(function MiniCardStack({ count }: { count: number }) {
  return (
    <div className="relative mx-auto h-20 w-14">
      {Array.from({ length: Math.min(count, 3) }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-lg border border-white/80 bg-white"
          style={{
            width: "100%",
            height: "100%",
            transform: `translateY(${-i * 3}px) rotate(${(i - 1) * 4}deg)`,
            zIndex: i,
          }}
        />
      ))}
    </div>
  );
});
