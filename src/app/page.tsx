"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/hooks/use-session";
import { Eye, Users, Crosshair } from "lucide-react";

interface CreateRoomResponse {
  playerId: string;
  code: string;
  roomId: string;
  error?: string;
}

interface JoinRoomResponse {
  playerId: string;
  code: string;
  roomId: string;
  error?: string;
}

export default function Home() {
  const router = useRouter();
  const { setSession } = useSession();
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name.trim() }),
      });
      const data = (await res.json()) as CreateRoomResponse;
      if (!res.ok) throw new Error(data.error);

      setSession({
        playerId: data.playerId,
        roomCode: data.code,
        roomId: data.roomId,
        isHost: true,
      });
      router.push(`/room/${data.code}`);
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  }, [name, router, setSession]);

  const handleJoin = useCallback(async () => {
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    if (!joinCode.trim()) {
      setError("Enter a room code");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const code = joinCode.trim().toUpperCase();
      const res = await fetch(`/api/rooms/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim() }),
      });
      const data = (await res.json()) as JoinRoomResponse;
      if (!res.ok) throw new Error(data.error);

      setSession({
        playerId: data.playerId,
        roomCode: data.code,
        roomId: data.roomId,
        isHost: false,
      });
      router.push(`/room/${data.code}`);
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to join room");
    } finally {
      setIsLoading(false);
    }
  }, [name, joinCode, router, setSession]);

  const handleSetModeCreate = useCallback(() => setMode("create"), []);
  const handleSetModeJoin = useCallback(() => setMode("join"), []);
  const handleBack = useCallback(() => {
    setMode("idle");
    setError("");
  }, []);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [],
  );

  const handleJoinCodeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setJoinCode(event.target.value.toUpperCase()),
    [],
  );

  const handleCreateKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") void handleCreate();
    },
    [handleCreate],
  );

  const handleJoinKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") void handleJoin();
    },
    [handleJoin],
  );

  const handleCreateClick = useCallback(() => {
    void handleCreate();
  }, [handleCreate]);

  const handleJoinClick = useCallback(() => {
    void handleJoin();
  }, [handleJoin]);

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Spyfall</h1>
          <p className="text-muted-foreground">
            Find the spy before they figure out where you are.
          </p>
        </div>

        {mode === "idle" && (
          <div className="space-y-3">
            <Button
              className="w-full h-14 text-lg gap-2"
              onClick={handleSetModeCreate}
            >
              <Users className="h-5 w-5" />
              Create Room
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-lg gap-2"
              onClick={handleSetModeJoin}
            >
              <Crosshair className="h-5 w-5" />
              Join Room
            </Button>
          </div>
        )}

        {mode === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Create a Room</CardTitle>
              <CardDescription>You&apos;ll be the host of this game.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Your name"
                value={name}
                onChange={handleNameChange}
                maxLength={20}
                autoFocus
                onKeyDown={handleCreateKeyDown}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleBack}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleCreateClick} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === "join" && (
          <Card>
            <CardHeader>
              <CardTitle>Join a Room</CardTitle>
              <CardDescription>Enter the 5-letter code from the host.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Your name"
                value={name}
                onChange={handleNameChange}
                maxLength={20}
                autoFocus
              />
              <Input
                placeholder="Room code"
                value={joinCode}
                onChange={handleJoinCodeChange}
                maxLength={5}
                className="text-center text-2xl tracking-[0.3em] font-mono uppercase"
                onKeyDown={handleJoinKeyDown}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleBack}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleJoinClick} disabled={isLoading}>
                  {isLoading ? "Joining..." : "Join"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>3-12 players &middot; 8 minute rounds &middot; 46 locations</p>
          <p>Inspired by the board game Spyfall</p>
        </div>
      </div>
    </main>
  );
}
