"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { useSession } from "@/shared/hooks/use-session";
import { createRoom, joinRoom } from "@/domains/room/actions";
import { Eye, Users, Crosshair } from "lucide-react";

/* ── Subcomponents ────────────────────────────────────── */

export const HeroSection = React.memo(function HeroSection() {
  return (
    <div className="text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Eye className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Spyfall</h1>
      <p className="text-muted-foreground">
        Find the spy before they figure out where you are.
      </p>
    </div>
  );
});

interface ModeSelectorProps {
  onCreateMode: () => void;
  onJoinMode: () => void;
}

export const ModeSelector = React.memo(function ModeSelector({ onCreateMode, onJoinMode }: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <Button className="w-full h-14 text-lg gap-2" onClick={onCreateMode}>
        <Users className="h-5 w-5" />
        Create Room
      </Button>
      <Button variant="outline" className="w-full h-14 text-lg gap-2" onClick={onJoinMode}>
        <Crosshair className="h-5 w-5" />
        Join Room
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Room</CardTitle>
        <CardDescription>You&apos;ll be the host of this game.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Your name" value={name} onChange={onNameChange} maxLength={20} autoFocus onKeyDown={onKeyDown} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button className="flex-1" onClick={onCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a Room</CardTitle>
        <CardDescription>Enter the 5-letter code from the host.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Your name" value={name} onChange={onNameChange} maxLength={20} autoFocus />
        <Input
          placeholder="Room code"
          value={joinCode}
          onChange={onJoinCodeChange}
          maxLength={5}
          className="text-center text-2xl tracking-[0.3em] font-mono uppercase"
          onKeyDown={onKeyDown}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button className="flex-1" onClick={onJoin} disabled={isLoading}>
            {isLoading ? "Joining..." : "Join"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export const FooterInfo = React.memo(function FooterInfo() {
  return (
    <>
      <Separator />
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>3-12 players &middot; 8 minute rounds &middot; 54 locations</p>
        <p>Inspired by the board game Spyfall</p>
      </div>
    </>
  );
});

/* ── Hook ─────────────────────────────────────────────── */

export function useHomeState() {
  const router = useRouter();
  const { setSession } = useSession();
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = useCallback(async () => {
    if (!name.trim()) { setError("Enter your name"); return; }
    setIsLoading(true);
    setError("");
    try {
      const result = await createRoom({ hostName: name.trim() });
      if (!result.success) throw new Error(result.error);
      const { playerId, code: roomCode, roomId } = result.data;
      setSession({ playerId, roomCode, roomId, isHost: true });
      router.push(`/room/${roomCode}`);
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to create room");
    } finally { setIsLoading(false); }
  }, [name, router, setSession]);

  const handleJoin = useCallback(async () => {
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!joinCode.trim()) { setError("Enter a room code"); return; }
    setIsLoading(true);
    setError("");
    try {
      const code = joinCode.trim().toUpperCase();
      const result = await joinRoom({ playerName: name.trim(), roomCode: code });
      if (!result.success) throw new Error(result.error);
      const { playerId, code: joinedCode, roomId } = result.data;
      setSession({ playerId, roomCode: joinedCode, roomId, isHost: false });
      router.push(`/room/${joinedCode}`);
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to join room");
    } finally { setIsLoading(false); }
  }, [name, joinCode, router, setSession]);

  const handleSetModeCreate = useCallback(() => setMode("create"), []);
  const handleSetModeJoin = useCallback(() => setMode("join"), []);
  const handleBack = useCallback(() => { setMode("idle"); setError(""); }, []);
  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value), []);
  const handleJoinCodeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setJoinCode(event.target.value.toUpperCase()), []);
  const handleCreateKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") void handleCreate(); }, [handleCreate]);
  const handleJoinKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") void handleJoin(); }, [handleJoin]);
  const handleCreateClick = useCallback(() => { void handleCreate(); }, [handleCreate]);
  const handleJoinClick = useCallback(() => { void handleJoin(); }, [handleJoin]);

  return { mode, name, joinCode, isLoading, error, handleSetModeCreate, handleSetModeJoin, handleBack, handleNameChange, handleJoinCodeChange, handleCreateKeyDown, handleJoinKeyDown, handleCreateClick, handleJoinClick };
}
