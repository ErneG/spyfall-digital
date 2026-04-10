"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Compass, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { startGame } from "@/domains/game/actions";
import { DEFAULT_LOCATIONS } from "@/domains/location/data";
import { createPassAndPlayRoom } from "@/domains/room/actions";
import { LOCATION_CATEGORIES } from "@/shared/config/location-catalog";
import { useSession } from "@/shared/hooks/use-session";
import { DEFAULT_TIME_LIMIT } from "@/shared/lib/constants";
import { unwrapAction } from "@/shared/lib/unwrap-action";
import { cn } from "@/shared/lib/utils";
import { LocationCatalogPreview } from "@/shared/ui/location-catalog-preview";

import { PassAndPlayForm } from "../../pass-and-play-form";

const shellClassName =
  "rounded-[32px] border border-white/10 bg-white/[0.05] shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl";

export function PassAndPlaySetupClient() {
  const router = useRouter();
  const { session, setSession } = useSession();
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""]);
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME_LIMIT);
  const [spyCount, setSpyCount] = useState(1);
  const [hideSpyCount, setHideSpyCount] = useState(false);
  const [categories, setCategories] = useState<string[]>([...LOCATION_CATEGORIES]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.roomCode) {
      router.replace(`/room/${session.roomCode}`);
    }
  }, [router, session]);

  const previewLocations = useMemo(
    () => DEFAULT_LOCATIONS.filter((location) => categories.includes(location.category)),
    [categories],
  );

  const totalRoles = useMemo(
    () => previewLocations.reduce((sum, location) => sum + location.roles.length, 0),
    [previewLocations],
  );

  const passAndPlayMutation = useMutation({
    mutationFn: async (trimmedNames: string[]) => {
      const roomResult = await createPassAndPlayRoom({
        playerNames: trimmedNames,
        timeLimit,
        spyCount,
        hideSpyCount,
        categories,
      });
      const room = unwrapAction(roomResult);
      const gameResult = await startGame({ roomId: room.roomId, playerId: room.hostPlayerId });
      const game = unwrapAction(gameResult);
      return { game, room };
    },
    onSuccess: ({ room, game }) => {
      setSession({
        allPlayers: room.players,
        gameId: game.gameId,
        gameStartedAt: game.startedAt,
        hideSpyCount,
        isHost: true,
        passAndPlay: true,
        playerId: room.hostPlayerId,
        roomCode: room.code,
        roomId: room.roomId,
        spyCount,
        timeLimit,
      });
      router.push(`/room/${room.code}`);
    },
    onError: (caughtError) => {
      setError(caughtError.message);
    },
  });

  const handlePlayerNameChange = useCallback((index: number, value: string) => {
    setPlayerNames((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }, []);

  const handleAddPlayer = useCallback(() => {
    setPlayerNames((previous) => [...previous, ""]);
  }, []);

  const handleRemovePlayer = useCallback((index: number) => {
    setPlayerNames((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
  }, []);

  const handleReorderPlayers = useCallback((newNames: string[]) => {
    setPlayerNames(newNames);
  }, []);

  const handleStart = useCallback(() => {
    const trimmed = playerNames.map((name) => name.trim());
    if (trimmed.some((name) => !name)) {
      setError("All player names are required.");
      return;
    }
    const uniqueNames = new Set(trimmed.map((name) => name.toLowerCase()));
    if (uniqueNames.size !== trimmed.length) {
      setError("Each player needs a unique name.");
      return;
    }
    setError("");
    passAndPlayMutation.mutate(trimmed);
  }, [passAndPlayMutation, playerNames]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#06070a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.16),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.14),transparent_28%),linear-gradient(180deg,#0a0d14_0%,#050608_100%)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className={cn(shellClassName, "flex flex-col gap-4 p-6 lg:flex-row lg:items-end")}>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/55">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.03]"
              >
                <ArrowLeft className="size-3.5" />
                Home
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-cyan-100">
                <Sparkles className="size-3.5" />
                Pass &amp; Play V2
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.24em] text-white/45 uppercase">
                Private setup, one shared device
              </p>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Build the round before anyone starts peeking.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                This setup flow keeps pass-and-play self-contained: players, round settings, source
                filtering, and a full preview of the included location list before the game starts.
              </p>
            </div>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-white/40 uppercase">
                Players
              </p>
              <p className="mt-3 text-2xl font-semibold">{playerNames.length}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-white/40 uppercase">
                Locations
              </p>
              <p className="mt-3 text-2xl font-semibold">{previewLocations.length}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-white/40 uppercase">
                Roles
              </p>
              <p className="mt-3 text-2xl font-semibold">{totalRoles}</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section className={cn(shellClassName, "p-6")}>
            <PassAndPlayForm
              playerNames={playerNames}
              timeLimit={timeLimit}
              spyCount={spyCount}
              hideSpyCount={hideSpyCount}
              categories={categories}
              error={error}
              isLoading={passAndPlayMutation.isPending}
              onPlayerNameChange={handlePlayerNameChange}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onReorderPlayers={handleReorderPlayers}
              onTimeLimitChange={setTimeLimit}
              onSpyCountChange={setSpyCount}
              onHideSpyCountChange={setHideSpyCount}
              onCategoriesChange={setCategories}
              onBack={() => router.push("/")}
              onStart={handleStart}
            />
          </section>

          <section className={cn(shellClassName, "p-6")}>
            <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">
                  <Compass className="size-3.5" />
                  Included Locations
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  See exactly what can appear
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-white/60">
                  This preview updates instantly as categories change, so pass-and-play no longer
                  hides the actual location pool behind a blind start button.
                </p>
              </div>
              <Link
                href="/library"
                className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
              >
                <BookOpen className="size-4" />
                Browse full library
              </Link>
            </div>

            <div className="mt-5">
              <LocationCatalogPreview
                locations={previewLocations}
                emptyTitle="No locations selected"
                emptyDescription="Choose at least one category to start building the round."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
