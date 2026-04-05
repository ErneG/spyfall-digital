"use client";

import React from "react";

import { NameSuggestions } from "@/domains/profile/components/name-suggestions";
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
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t.home.joinRoom}</h2>
        <p className="text-muted-foreground text-[13px]">{t.home.joinRoomDesc}</p>
      </div>
      <div className="space-y-4">
        <Input
          placeholder={t.home.yourName}
          value={name}
          onChange={onNameChange}
          maxLength={20}
          autoFocus
          className="bg-surface-1 placeholder:text-muted-foreground/60 h-[52px] rounded-2xl border-transparent text-[15px] focus:border-transparent"
        />
        <NameSuggestions onSelect={onNameSelect} />
        <Input
          placeholder={t.home.roomCode}
          value={joinCode}
          onChange={onJoinCodeChange}
          maxLength={5}
          className="bg-surface-1 placeholder:text-muted-foreground/60 h-[52px] rounded-2xl border-transparent text-center font-mono text-2xl tracking-[0.3em] uppercase focus:border-transparent"
          onKeyDown={onKeyDown}
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
