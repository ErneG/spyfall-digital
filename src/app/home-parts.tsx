"use client";

import React, { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { useSession } from "@/shared/hooks/use-session";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { createRoom, joinRoom, createPassAndPlayRoom } from "@/domains/room/actions";
import { startGame } from "@/domains/game/actions";
import { unwrapAction } from "@/shared/lib/unwrap-action";
import { TIMER_PRESETS } from "@/domains/room/schema";
import { MIN_PLAYERS, MAX_PLAYERS, DEFAULT_TIME_LIMIT } from "@/shared/lib/constants";
import { Eye, EyeOff, Users, Crosshair, Smartphone, Plus, X, Clock } from "lucide-react";
import { useTranslation } from "@/shared/i18n/context";

const SPY_OPTIONS = [1, 2] as const;

/* ── Subcomponents ────────────────────────────────────── */

export const HeroSection = React.memo(function HeroSection() {
  const { t } = useTranslation();
  return (
    <div className="text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Eye className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">{t.home.title}</h1>
      <p className="text-muted-foreground">
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

export const ModeSelector = React.memo(function ModeSelector({ onCreateMode, onJoinMode, onPassAndPlayMode }: ModeSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <Button className="w-full h-14 text-lg gap-2" onClick={onCreateMode}>
        <Users className="h-5 w-5" />
        {t.home.createRoom}
      </Button>
      <Button variant="outline" className="w-full h-14 text-lg gap-2" onClick={onJoinMode}>
        <Crosshair className="h-5 w-5" />
        {t.home.joinRoom}
      </Button>
      <Button variant="outline" className="w-full h-14 text-lg gap-2" onClick={onPassAndPlayMode}>
        <Smartphone className="h-5 w-5" />
        {t.home.passAndPlay}
      </Button>
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
  name, error, isLoading, onNameChange, onKeyDown, onBack, onCreate,
}: CreateRoomFormProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.home.createRoom}</CardTitle>
        <CardDescription>{t.home.createRoomDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder={t.home.yourName} value={name} onChange={onNameChange} maxLength={20} autoFocus onKeyDown={onKeyDown} />
        {error && <p className="text-sm text-destructive">{t.errors[error as keyof typeof t.errors] ?? error}</p>}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>{t.common.back}</Button>
          <Button className="flex-1" onClick={onCreate} disabled={isLoading}>
            {isLoading ? t.home.creating : t.home.create}
          </Button>
        </div>
      </CardContent>
    </Card>
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
  name, joinCode, error, isLoading, onNameChange, onJoinCodeChange, onKeyDown, onBack, onJoin,
}: JoinRoomFormProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.home.joinRoom}</CardTitle>
        <CardDescription>{t.home.joinRoomDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder={t.home.yourName} value={name} onChange={onNameChange} maxLength={20} autoFocus />
        <Input
          placeholder={t.home.roomCode}
          value={joinCode}
          onChange={onJoinCodeChange}
          maxLength={5}
          className="text-center text-2xl tracking-[0.3em] font-mono uppercase"
          onKeyDown={onKeyDown}
        />
        {error && <p className="text-sm text-destructive">{t.errors[error as keyof typeof t.errors] ?? error}</p>}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>{t.common.back}</Button>
          <Button className="flex-1" onClick={onJoin} disabled={isLoading}>
            {isLoading ? t.home.joining : t.home.join}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

const PlayerNameRow = React.memo(function PlayerNameRow({
  index, name, canRemove, onNameChange, onRemove,
}: {
  index: number; name: string; canRemove: boolean;
  onNameChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const { t } = useTranslation();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onNameChange(index, event.target.value),
    [index, onNameChange],
  );
  const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);
  return (
    <div className="flex gap-2">
      <Input placeholder={`${t.home.playerN} ${index + 1}`} value={name} onChange={handleChange} maxLength={20} />
      {canRemove && (
        <Button variant="ghost" size="icon" className="shrink-0" onClick={handleRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

const PnPPresetButton = React.memo(function PnPPresetButton({
  label, value, isSelected, onClick,
}: { label: string; value: number; isSelected: boolean; onClick: (value: number) => void }) {
  const handleClick = useCallback(() => onClick(value), [onClick, value]);
  return (
    <button
      onClick={handleClick}
      className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
        isSelected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
      }`}
    >
      {label}
    </button>
  );
});

interface PassAndPlayFormProps {
  playerNames: string[];
  timeLimit: number;
  spyCount: number;
  hideSpyCount: boolean;
  error: string;
  isLoading: boolean;
  onPlayerNameChange: (index: number, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onTimeLimitChange: (value: number) => void;
  onSpyCountChange: (value: number) => void;
  onHideSpyCountChange: (checked: boolean) => void;
  onBack: () => void;
  onStart: () => void;
}

export const PassAndPlayForm = React.memo(function PassAndPlayForm({
  playerNames, timeLimit, spyCount, hideSpyCount, error, isLoading,
  onPlayerNameChange, onAddPlayer, onRemovePlayer,
  onTimeLimitChange, onSpyCountChange, onHideSpyCountChange,
  onBack, onStart,
}: PassAndPlayFormProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.home.passAndPlay}</CardTitle>
        <CardDescription>{t.home.passAndPlayDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {playerNames.map((name, index) => (
            <PlayerNameRow
              key={index}
              index={index}
              name={name}
              canRemove={playerNames.length > MIN_PLAYERS}
              onNameChange={onPlayerNameChange}
              onRemove={onRemovePlayer}
            />
          ))}
        </div>
        {playerNames.length < MAX_PLAYERS && (
          <Button variant="outline" size="sm" className="w-full gap-1" onClick={onAddPlayer}>
            <Plus className="h-4 w-4" /> {t.home.addPlayer}
          </Button>
        )}

        <Separator />

        <div className="space-y-2">
          <Label className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3 w-3" /> {t.config.timer}</Label>
          <div className="flex gap-1.5">
            {TIMER_PRESETS.map((preset) => (
              <PnPPresetButton key={preset.value} label={preset.label} value={preset.value} isSelected={timeLimit === preset.value} onClick={onTimeLimitChange} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">{t.config.spies}</Label>
          <div className="flex gap-1.5">
            {SPY_OPTIONS.map((count) => (
              <PnPPresetButton key={count} label={`${count} ${count === 1 ? t.config.spy : t.config.spiesPlural}`} value={count} isSelected={spyCount === count} onClick={onSpyCountChange} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="pnp-hide-spy" className="flex items-center gap-1.5 text-sm">
            {hideSpyCount ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {t.config.hideSpyCount}
          </Label>
          <Switch id="pnp-hide-spy" checked={hideSpyCount} onCheckedChange={onHideSpyCountChange} />
        </div>

        {error && <p className="text-sm text-destructive">{t.errors[error as keyof typeof t.errors] ?? error}</p>}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>{t.common.back}</Button>
          <Button className="flex-1" onClick={onStart} disabled={isLoading}>
            {isLoading ? t.home.starting : t.home.startGame}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export const FooterInfo = React.memo(function FooterInfo() {
  const { t } = useTranslation();
  return (
    <>
      <Separator />
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>{t.home.footer}</p>
        <p>{t.home.footerInspired}</p>
      </div>
    </>
  );
});

/* ── Hook ─────────────────────────────────────────────── */

export function useHomeState() {
  const router = useRouter();
  const { setSession } = useSession();
  const [mode, setMode] = useState<"idle" | "create" | "join" | "pass-and-play">("idle");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""]);
  const [pnpTimeLimit, setPnpTimeLimit] = useState(DEFAULT_TIME_LIMIT);
  const [pnpSpyCount, setPnpSpyCount] = useState(1);
  const [shouldPnpHideSpyCount, setPnpHideSpyCount] = useState(false);
  const [error, setError] = useState("");

  const createRoomMutation = useMutation({
    mutationFn: (hostName: string) => createRoom({ hostName }).then(unwrapAction),
    onSuccess: ({ playerId, code: roomCode, roomId }) => {
      setSession({ playerId, roomCode, roomId, isHost: true });
      router.push(`/room/${roomCode}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const joinRoomMutation = useMutation({
    mutationFn: ({ playerName, roomCode }: { playerName: string; roomCode: string }) =>
      joinRoom({ playerName, roomCode }).then(unwrapAction),
    onSuccess: ({ playerId, code: joinedCode, roomId }) => {
      setSession({ playerId, roomCode: joinedCode, roomId, isHost: false });
      router.push(`/room/${joinedCode}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const passAndPlayMutation = useMutation({
    mutationFn: async (trimmedNames: string[]) => {
      const room = await createPassAndPlayRoom({
        playerNames: trimmedNames,
        timeLimit: pnpTimeLimit,
        spyCount: pnpSpyCount,
        hideSpyCount: shouldPnpHideSpyCount,
      }).then(unwrapAction);
      await startGame({ roomId: room.roomId, playerId: room.hostPlayerId }).then(unwrapAction);
      return room;
    },
    onSuccess: ({ hostPlayerId, code: roomCode, roomId, players }) => {
      setSession({ playerId: hostPlayerId, roomCode, roomId, isHost: true, passAndPlay: true, allPlayers: players });
      router.push(`/room/${roomCode}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const isLoading = createRoomMutation.isPending || joinRoomMutation.isPending || passAndPlayMutation.isPending;

  const handlePnpTimeLimitChange = useCallback((value: number) => setPnpTimeLimit(value), []);
  const handlePnpSpyCountChange = useCallback((value: number) => setPnpSpyCount(value), []);
  const handlePnpHideSpyCountChange = useCallback((checked: boolean) => setPnpHideSpyCount(checked), []);

  const handleCreateClick = useCallback(() => {
    if (!name.trim()) { setError("enterName"); return; }
    setError("");
    createRoomMutation.mutate(name.trim());
  }, [name, createRoomMutation]);

  const handleJoinClick = useCallback(() => {
    if (!name.trim()) { setError("enterName"); return; }
    if (!joinCode.trim()) { setError("enterRoomCode"); return; }
    setError("");
    joinRoomMutation.mutate({ playerName: name.trim(), roomCode: joinCode.trim().toUpperCase() });
  }, [name, joinCode, joinRoomMutation]);

  const handlePassAndPlayClick = useCallback(() => {
    const trimmed = playerNames.map((n) => n.trim());
    if (trimmed.some((n) => !n)) { setError("allNamesRequired"); return; }
    const unique = new Set(trimmed.map((n) => n.toLowerCase()));
    if (unique.size !== trimmed.length) { setError("uniqueNames"); return; }
    setError("");
    passAndPlayMutation.mutate(trimmed);
  }, [playerNames, passAndPlayMutation]);

  const handleSetModeCreate = useCallback(() => setMode("create"), []);
  const handleSetModeJoin = useCallback(() => setMode("join"), []);
  const handleSetModePassAndPlay = useCallback(() => setMode("pass-and-play"), []);
  const handleBack = useCallback(() => { setMode("idle"); setError(""); }, []);
  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value), []);
  const handleJoinCodeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setJoinCode(event.target.value.toUpperCase()), []);
  const handleCreateKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") handleCreateClick(); }, [handleCreateClick]);
  const handleJoinKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") handleJoinClick(); }, [handleJoinClick]);
  const handlePlayerNameChange = useCallback((index: number, value: string) => {
    setPlayerNames((previous) => { const next = [...previous]; next[index] = value; return next; });
  }, []);
  const handleAddPlayer = useCallback(() => {
    setPlayerNames((previous) => [...previous, ""]);
  }, []);
  const handleRemovePlayer = useCallback((index: number) => {
    setPlayerNames((previous) => previous.filter((_, i) => i !== index));
  }, []);

  return {
    mode, name, joinCode, playerNames, isLoading, error,
    pnpTimeLimit, pnpSpyCount, shouldPnpHideSpyCount,
    handleSetModeCreate, handleSetModeJoin, handleSetModePassAndPlay, handleBack,
    handleNameChange, handleJoinCodeChange, handleCreateKeyDown, handleJoinKeyDown,
    handleCreateClick, handleJoinClick, handlePassAndPlayClick,
    handlePlayerNameChange, handleAddPlayer, handleRemovePlayer,
    handlePnpTimeLimitChange, handlePnpSpyCountChange, handlePnpHideSpyCountChange,
  };
}
