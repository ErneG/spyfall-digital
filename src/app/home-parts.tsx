"use client";

import { Users, Crosshair, Smartphone, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import React from "react";

import { NameSuggestions } from "@/domains/profile/components/name-suggestions";
import { useTranslation } from "@/shared/i18n/context";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

/* ── Spy Eye Logo ────────────────────────────────────── */

const SpyEyeLogo = React.memo(function SpyEyeLogo() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Outer eye shape */}
      <path
        d="M32 16C18 16 8 32 8 32s10 16 24 16 24-16 24-16S46 16 32 16z"
        stroke="#64748B"
        strokeWidth="2"
        fill="none"
      />
      {/* Iris */}
      <circle
        cx="32"
        cy="32"
        r="10"
        stroke="#0F766E"
        strokeWidth="2"
        fill="rgba(15,118,110,0.10)"
      />
      {/* Pupil */}
      <circle cx="32" cy="32" r="4" fill="#0F766E" />
      {/* Crosshair lines */}
      <line x1="32" y1="18" x2="32" y2="26" stroke="#64748B" strokeWidth="1" opacity="0.5" />
      <line x1="32" y1="38" x2="32" y2="46" stroke="#64748B" strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="32" x2="26" y2="32" stroke="#64748B" strokeWidth="1" opacity="0.5" />
      <line x1="38" y1="32" x2="46" y2="32" stroke="#64748B" strokeWidth="1" opacity="0.5" />
    </svg>
  );
});

/* ── Subcomponents ────────────────────────────────────── */

export const HeroSection = React.memo(function HeroSection() {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/60 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase shadow-[0_16px_40px_rgba(148,163,184,0.16)] backdrop-blur-xl">
        <Sparkles className="size-3.5 text-teal-700" />
        Premium social deduction
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-[28px] border border-white/75 bg-white/62 p-4 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl">
          <SpyEyeLogo />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
            {t.home.subtitle}
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            The cleanest way to run Spyfall on one screen.
          </h1>
        </div>
      </div>
      <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
        Pass-and-play is now the front door: choose your source, preview the real location pool, and
        start a round that feels private, calm, and intentional instead of improvised.
      </p>
    </div>
  );
});

interface ModeSelectorProps {
  onCreateMode: () => void;
  onJoinMode: () => void;
  onPassAndPlayMode: () => void;
}

const ModeCard = React.memo(function ModeCard({
  onClick,
  icon,
  iconClass,
  className,
  title,
  desc,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  iconClass: string;
  className: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[28px] border px-5 py-5 text-left shadow-[0_20px_50px_rgba(148,163,184,0.16)] transition-transform hover:-translate-y-0.5 active:scale-[0.99] ${className}`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-[17px] font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-[13px] leading-6 text-slate-600">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </button>
  );
});

export const ModeSelector = React.memo(function ModeSelector({
  onCreateMode,
  onJoinMode,
  onPassAndPlayMode,
}: ModeSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <ModeCard
        onClick={onPassAndPlayMode}
        icon={<Smartphone className="h-5 w-5 text-white" />}
        iconClass="bg-slate-950"
        className="border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(232,245,255,0.86))]"
        title={t.home.passAndPlay}
        desc="Build the round first, preview the source, and hand the device around with confidence."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <ModeCard
          onClick={onCreateMode}
          icon={<Users className="h-5 w-5 text-sky-900" />}
          iconClass="bg-sky-100"
          className="border-white/70 bg-white/58"
          title={t.home.createRoom}
          desc={t.home.createRoomDesc}
        />
        <ModeCard
          onClick={onJoinMode}
          icon={<Crosshair className="h-5 w-5 text-slate-700" />}
          iconClass="bg-slate-100"
          className="border-white/70 bg-white/58"
          title={t.home.joinRoom}
          desc={t.home.joinRoomDesc}
        />
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/58 px-4 py-2 text-xs font-medium text-slate-600 shadow-[0_12px_30px_rgba(148,163,184,0.12)] backdrop-blur-xl">
          <BookOpen className="size-3.5 text-teal-700" />
          Browse and edit your location library before you play
        </div>
        <Link
          href="/library"
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "rounded-full border-white/70 bg-white/58 px-4 text-slate-700 hover:bg-white hover:text-slate-950",
          )}
        >
          Browse Library
        </Link>
      </div>
    </div>
  );
});

interface CreateRoomFormProps {
  name: string;
  error: string;
  isLoading: boolean;
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNameSelect: (name: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onCreate: () => void;
}

export const CreateRoomForm = React.memo(function CreateRoomForm({
  name,
  error,
  isLoading,
  onNameChange,
  onNameSelect,
  onKeyDown,
  onBack,
  onCreate,
}: CreateRoomFormProps) {
  const { t } = useTranslation();
  const translatedError = Object.hasOwn(t.errors, error)
    ? t.errors[error as keyof typeof t.errors]
    : error;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-950">{t.home.createRoom}</h2>
        <p className="text-[13px] text-slate-500">{t.home.createRoomDesc}</p>
      </div>
      <div className="space-y-4">
        <Input
          placeholder={t.home.yourName}
          value={name}
          onChange={onNameChange}
          maxLength={20}
          autoFocus
          onKeyDown={onKeyDown}
          className="h-[52px] rounded-2xl border border-white/70 bg-white/72 text-[15px] text-slate-950 placeholder:text-slate-400 focus:border-sky-300 focus-visible:ring-sky-200"
        />
        <NameSuggestions onSelect={onNameSelect} />
        {error && <p className="text-[13px] text-rose-600">{translatedError}</p>}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="text-slate-500 hover:bg-slate-900/5">
            {t.common.back}
          </Button>
          <Button
            className="h-[52px] flex-1 rounded-2xl border border-slate-950/5 bg-slate-950 font-semibold text-white shadow-[0_18px_30px_rgba(15,23,42,0.18)] hover:bg-slate-900"
            onClick={onCreate}
            disabled={isLoading}
          >
            {isLoading ? t.home.creating : t.home.create}
          </Button>
        </div>
      </div>
    </div>
  );
});

export const FooterInfo = React.memo(function FooterInfo() {
  const { t } = useTranslation();
  return (
    <>
      <div className="h-px bg-slate-200/80" />
      <div className="space-y-1 text-center text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase">
        <p>{t.home.footer}</p>
        <p>{t.home.footerInspired}</p>
      </div>
    </>
  );
});

/* ── Re-exports ──────────────────────────────────────── */

export { JoinRoomForm } from "./join-room-form";
export { PassAndPlayForm } from "./pass-and-play-form";
export { useHomeState } from "./use-home-state";
