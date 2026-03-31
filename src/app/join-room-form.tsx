"use client";

import React from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

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
