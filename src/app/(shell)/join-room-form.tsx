"use client";

import React from "react";

import { NameSuggestions } from "@/features/profile/components/name-suggestions";
import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface JoinRoomFormProps {
  name: string;
  joinCode: string;
  error: string;
  isLoading: boolean;
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNameSelect: (name: string) => void;
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
  onNameSelect,
  onJoinCodeChange,
  onKeyDown,
  onBack,
  onJoin,
}: JoinRoomFormProps) {
  const { t } = useTranslation();
  const translatedError = Object.hasOwn(t.errors, error)
    ? t.errors[error as keyof typeof t.errors]
    : error;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-950">{t.home.joinRoom}</h2>
        <p className="text-[13px] text-slate-500">{t.home.joinRoomDesc}</p>
      </div>
      <div className="space-y-4">
        <Input
          placeholder={t.home.yourName}
          value={name}
          onChange={onNameChange}
          maxLength={20}
          autoFocus
          className="h-[52px] rounded-2xl border border-white/70 bg-white/72 text-[15px] text-slate-950 placeholder:text-slate-400 focus:border-sky-300 focus-visible:ring-sky-200"
        />
        <NameSuggestions onSelect={onNameSelect} />
        <Input
          placeholder={t.home.roomCode}
          value={joinCode}
          onChange={onJoinCodeChange}
          maxLength={5}
          className="h-[52px] rounded-2xl border border-white/70 bg-white/72 text-center font-mono text-2xl tracking-[0.3em] text-slate-950 uppercase placeholder:text-slate-400 focus:border-sky-300 focus-visible:ring-sky-200"
          onKeyDown={onKeyDown}
        />
        {error && <p className="text-[13px] text-rose-600">{translatedError}</p>}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="text-slate-500 hover:bg-slate-900/5">
            {t.common.back}
          </Button>
          <Button
            className="h-[52px] flex-1 rounded-2xl border border-slate-950/5 bg-slate-950 font-semibold text-white shadow-[0_18px_30px_rgba(15,23,42,0.18)] hover:bg-slate-900"
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
