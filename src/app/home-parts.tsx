"use client";

import { Eye, Users, Crosshair, Smartphone, ChevronRight } from "lucide-react";
import React from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

/* ── Subcomponents ────────────────────────────────────── */

export const HeroSection = React.memo(function HeroSection() {
  const { t } = useTranslation();
  return (
    <div className="space-y-2 text-center">
      <Eye className="mx-auto h-6 w-6 text-[#8E8E93]" />
      <h1 className="text-5xl font-bold tracking-tight">{t.home.title}</h1>
      <p className="text-[11px] tracking-[0.08em] text-[#48484A] uppercase">{t.home.subtitle}</p>
    </div>
  );
});

interface ModeSelectorProps {
  onCreateMode: () => void;
  onJoinMode: () => void;
  onPassAndPlayMode: () => void;
}

export const ModeSelector = React.memo(function ModeSelector({
  onCreateMode,
  onJoinMode,
  onPassAndPlayMode,
}: ModeSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-2xl bg-[#141414]">
      <button
        onClick={onCreateMode}
        className="flex h-[56px] w-full items-center gap-3 px-4 transition-colors hover:bg-white/5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/12">
          <Users className="h-5 w-5 text-[#8B5CF6]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[15px] font-semibold">{t.home.createRoom}</p>
          <p className="text-[12px] text-[#8E8E93]">{t.home.createRoomDesc}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-[#48484A]" />
      </button>
      <div className="mx-4 h-px bg-white/5" />
      <button
        onClick={onJoinMode}
        className="flex h-[56px] w-full items-center gap-3 px-4 transition-colors hover:bg-white/5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8">
          <Crosshair className="h-5 w-5 text-[#8E8E93]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[15px] font-semibold">{t.home.joinRoom}</p>
          <p className="text-[12px] text-[#8E8E93]">{t.home.joinRoomDesc}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-[#48484A]" />
      </button>
      <div className="mx-4 h-px bg-white/5" />
      <button
        onClick={onPassAndPlayMode}
        className="flex h-[56px] w-full items-center gap-3 px-4 transition-colors hover:bg-white/5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8">
          <Smartphone className="h-5 w-5 text-[#8E8E93]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[15px] font-semibold">{t.home.passAndPlay}</p>
          <p className="text-[12px] text-[#8E8E93]">{t.home.passAndPlayDesc}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-[#48484A]" />
      </button>
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
        <p className="text-[13px] text-[#8E8E93]">{t.home.createRoomDesc}</p>
      </div>
      <div className="space-y-4">
        <Input
          placeholder={t.home.yourName}
          value={name}
          onChange={onNameChange}
          maxLength={20}
          autoFocus
          onKeyDown={onKeyDown}
          className="h-[52px] rounded-2xl border-transparent bg-[#141414] text-[15px] placeholder:text-[#48484A] focus:border-transparent"
        />
        {error && (
          <p className="text-[13px] text-[#EF4444]">
            {t.errors[error as keyof typeof t.errors] ?? error}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="text-[#8E8E93]">
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

interface JoinRoomFormProps {
  name: string;
  joinCode: string;
  error: string;
  isLoading: boolean;
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onJoinCodeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onJoin: () => void;
}

export const JoinRoomForm = React.memo(function JoinRoomForm({
  name,
  joinCode,
  error,
  isLoading,
  onNameChange,
  onJoinCodeChange,
  onKeyDown,
  onBack,
  onJoin,
}: JoinRoomFormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t.home.joinRoom}</h2>
        <p className="text-[13px] text-[#8E8E93]">{t.home.joinRoomDesc}</p>
      </div>
      <div className="space-y-4">
        <Input
          placeholder={t.home.yourName}
          value={name}
          onChange={onNameChange}
          maxLength={20}
          autoFocus
          className="h-[52px] rounded-2xl border-transparent bg-[#141414] text-[15px] placeholder:text-[#48484A] focus:border-transparent"
        />
        <Input
          placeholder={t.home.roomCode}
          value={joinCode}
          onChange={onJoinCodeChange}
          maxLength={5}
          className="h-[52px] rounded-2xl border-transparent bg-[#141414] text-center font-mono text-2xl tracking-[0.3em] uppercase placeholder:text-[#48484A] focus:border-transparent"
          onKeyDown={onKeyDown}
        />
        {error && (
          <p className="text-[13px] text-[#EF4444]">
            {t.errors[error as keyof typeof t.errors] ?? error}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="text-[#8E8E93]">
            {t.common.back}
          </Button>
          <Button
            className="h-[52px] flex-1 rounded-2xl bg-white font-semibold text-black hover:bg-white/90"
            onClick={onJoin}
            disabled={isLoading}
          >
            {isLoading ? t.home.joining : t.home.join}
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
      <div className="space-y-1 text-center text-[11px] text-[#48484A]">
        <p>{t.home.footer}</p>
        <p>{t.home.footerInspired}</p>
      </div>
    </>
  );
});

/* ── Re-exports ──────────────────────────────────────── */

export { PassAndPlayForm } from "./pass-and-play-form";
export { useHomeState } from "./use-home-state";
