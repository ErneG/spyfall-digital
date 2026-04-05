"use client";

import { Users, Crosshair, Smartphone, ChevronRight } from "lucide-react";
import React from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
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
        stroke="#8E8E93"
        strokeWidth="2"
        fill="none"
      />
      {/* Iris */}
      <circle
        cx="32"
        cy="32"
        r="10"
        stroke="#8B5CF6"
        strokeWidth="2"
        fill="rgba(139,92,246,0.12)"
      />
      {/* Pupil */}
      <circle cx="32" cy="32" r="4" fill="#8B5CF6" />
      {/* Crosshair lines */}
      <line x1="32" y1="18" x2="32" y2="26" stroke="#8E8E93" strokeWidth="1" opacity="0.5" />
      <line x1="32" y1="38" x2="32" y2="46" stroke="#8E8E93" strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="32" x2="26" y2="32" stroke="#8E8E93" strokeWidth="1" opacity="0.5" />
      <line x1="38" y1="32" x2="46" y2="32" stroke="#8E8E93" strokeWidth="1" opacity="0.5" />
    </svg>
  );
});

/* ── Subcomponents ────────────────────────────────────── */

export const HeroSection = React.memo(function HeroSection() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 text-center">
      <SpyEyeLogo />
      <h1 className="text-6xl font-bold tracking-tight">{t.home.title}</h1>
      <p className="text-muted-foreground/60 text-[11px] font-semibold tracking-[0.08em] uppercase">
        {t.home.subtitle}
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
  borderClass,
  title,
  desc,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  iconClass: string;
  borderClass: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-surface-1 flex h-[72px] w-full items-center gap-3 rounded-2xl border-l-2 px-4 ${borderClass} transition-transform active:scale-[0.98]`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="text-muted-foreground text-[12px]">{desc}</p>
      </div>
      <ChevronRight className="text-muted-foreground/60 h-4 w-4" />
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
    <div className="space-y-3">
      <ModeCard
        onClick={onCreateMode}
        icon={<Users className="text-spy-purple h-5 w-5" />}
        iconClass="bg-spy-purple/12"
        borderClass="border-spy-purple"
        title={t.home.createRoom}
        desc={t.home.createRoomDesc}
      />
      <ModeCard
        onClick={onJoinMode}
        icon={<Crosshair className="text-muted-foreground h-5 w-5" />}
        iconClass="bg-white/8"
        borderClass="border-muted-foreground/40"
        title={t.home.joinRoom}
        desc={t.home.joinRoomDesc}
      />
      <ModeCard
        onClick={onPassAndPlayMode}
        icon={<Smartphone className="text-success h-5 w-5" />}
        iconClass="bg-success/12"
        borderClass="border-success"
        title={t.home.passAndPlay}
        desc={t.home.passAndPlayDesc}
      />
    </div>
  );
});

interface CreateRoomFormProps {
  name: string;
  error: string;
  isLoading: boolean;
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onCreate: () => void;
}

export const CreateRoomForm = React.memo(function CreateRoomForm({
  name,
  error,
  isLoading,
  onNameChange,
  onKeyDown,
  onBack,
  onCreate,
}: CreateRoomFormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t.home.createRoom}</h2>
        <p className="text-muted-foreground text-[13px]">{t.home.createRoomDesc}</p>
      </div>
      <div className="space-y-4">
        <Input
          placeholder={t.home.yourName}
          value={name}
          onChange={onNameChange}
          maxLength={20}
          autoFocus
          onKeyDown={onKeyDown}
          className="bg-surface-1 placeholder:text-muted-foreground/60 h-[52px] rounded-2xl border-transparent text-[15px] focus:border-transparent"
        />
        {error && (
          <p className="text-spy-red text-[13px]">
            {t.errors[error as keyof typeof t.errors] ?? error}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
            {t.common.back}
          </Button>
          <Button
            className="h-[52px] flex-1 rounded-2xl bg-white font-semibold text-black hover:bg-white/90"
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
      <div className="h-px bg-white/5" />
      <div className="text-muted-foreground/60 space-y-1 text-center text-[11px] font-semibold tracking-[0.06em] uppercase">
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
