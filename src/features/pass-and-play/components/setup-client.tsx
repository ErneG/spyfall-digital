"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Compass, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";
import { startGame } from "@/domains/game/actions";
import { createPassAndPlayRoom } from "@/domains/room/actions";
import { type ContentSourceInput } from "@/entities/library/content-source";
import {
  addPlayerDraft,
  createInitialPlayerDrafts,
  removePlayerDraft,
  reorderPlayerDrafts,
  updatePlayerDraftName,
  type PlayerDraft,
} from "@/features/pass-and-play/player-drafts";
import { LOCATION_CATEGORIES, type LocationCategory } from "@/shared/config/location-catalog";
import { useSession } from "@/shared/hooks/use-session";
import { DEFAULT_TIME_LIMIT } from "@/shared/lib/constants";
import { unwrapAction } from "@/shared/lib/unwrap-action";
import { cn } from "@/shared/lib/utils";
import { LocationCatalogPreview } from "@/shared/ui/location-catalog-preview";

import { usePassAndPlaySources } from "../hooks/use-pass-and-play-sources";

import { PassAndPlayForm } from "./form";
import { PassAndPlaySourceSection } from "./source-section";

const shellClassName =
  "rounded-[34px] border border-white/80 bg-white/66 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl";

export function PassAndPlaySetupClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { session, setSession } = useSession();
  const [playerDrafts, setPlayerDrafts] = useState<PlayerDraft[]>(() =>
    createInitialPlayerDrafts(),
  );
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME_LIMIT);
  const [spyCount, setSpyCount] = useState(1);
  const [hideSpyCount, setHideSpyCount] = useState(false);
  const [categories, setCategories] = useState<LocationCategory[]>([...LOCATION_CATEGORIES]);
  const [sourceMode, setSourceMode] = useState<"built-in" | "collection">("built-in");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.roomCode) {
      router.replace(`/room/${session.roomCode}`);
    }
  }, [router, session]);

  const {
    availableCollections,
    collectionDetailQuery,
    collectionsQuery,
    previewLocations,
    source,
    totalRoles,
  } = usePassAndPlaySources({
    authLoading,
    categories,
    isAuthenticated,
    selectedCollectionId,
    sourceMode,
  });

  const passAndPlayMutation = useMutation({
    mutationFn: async (trimmedNames: string[]) => {
      const roomResult = await createPassAndPlayRoom({
        players: {
          names: trimmedNames,
        },
        settings: {
          timeLimit,
          spyCount,
          hideSpyCount,
        },
        source,
      });
      const room = unwrapAction(roomResult);
      const gameResult = await startGame({ roomId: room.roomId, playerId: room.hostPlayerId });
      const game = unwrapAction(gameResult);
      return { game, room };
    },
    onSuccess: ({ room, game }) => {
      setSession({
        mode: "pass-and-play",
        isHost: true,
        playerId: room.hostPlayerId,
        roomCode: room.code,
        roomId: room.roomId,
        resume: {
          players: room.players,
          gameId: game.gameId,
          gameStartedAt: game.startedAt,
          timeLimit,
          spyCount,
          hideSpyCount,
        },
      });
      router.push(`/room/${room.code}`);
    },
    onError: (caughtError) => {
      setError(caughtError.message);
    },
  });

  const handleSourceChange = useCallback((nextSource: ContentSourceInput) => {
    setError("");
    if (nextSource.kind === "collection") {
      setSourceMode("collection");
      setSelectedCollectionId(nextSource.collectionId);
      return;
    }

    setSourceMode("built-in");
    setCategories(
      nextSource.categories.length > 0 ? nextSource.categories : [...LOCATION_CATEGORIES],
    );
  }, []);

  const handlePlayerNameChange = useCallback((id: string, value: string) => {
    setPlayerDrafts((previous) => updatePlayerDraftName(previous, id, value));
  }, []);

  const handleAddPlayer = useCallback(() => {
    setPlayerDrafts((previous) => addPlayerDraft(previous));
  }, []);

  const handleRemovePlayer = useCallback((id: string) => {
    setPlayerDrafts((previous) => removePlayerDraft(previous, id));
  }, []);

  const handleReorderPlayers = useCallback((nextDrafts: PlayerDraft[]) => {
    setPlayerDrafts((previous) => reorderPlayerDrafts(previous, nextDrafts));
  }, []);

  const handleStart = useCallback(() => {
    const trimmed = playerDrafts.map((draft) => draft.name.trim());
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
  }, [passAndPlayMutation, playerDrafts]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#eef3f8] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.55)_30%,transparent_54%),radial-gradient(circle_at_85%_18%,rgba(191,219,254,0.55),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.44),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className={cn(shellClassName, "flex flex-col gap-4 p-6 lg:flex-row lg:items-end")}>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 transition hover:bg-white"
              >
                <ArrowLeft className="size-3.5" />
                Home
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-900">
                <Sparkles className="size-3.5" />
                Pass &amp; Play V2
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                Private setup, one shared device
              </p>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Build the round before anyone starts peeking.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                This setup flow keeps pass-and-play self-contained: players, round settings, source
                filtering, and a full preview of the included location list before the game starts.
              </p>
            </div>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/75 bg-white/72 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Players
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{playerDrafts.length}</p>
            </div>
            <div className="rounded-3xl border border-white/75 bg-white/72 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Locations
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {previewLocations.length}
              </p>
            </div>
            <div className="rounded-3xl border border-white/75 bg-white/72 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Roles
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{totalRoles}</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section className={cn(shellClassName, "p-6")}>
            <PassAndPlayForm
              players={playerDrafts}
              timeLimit={timeLimit}
              spyCount={spyCount}
              hideSpyCount={hideSpyCount}
              error={error}
              isLoading={passAndPlayMutation.isPending}
              sourceSection={
                <PassAndPlaySourceSection
                  collections={availableCollections}
                  isAuthenticated={isAuthenticated}
                  isLoadingCollections={collectionsQuery.isLoading}
                  source={source}
                  onSourceChange={handleSourceChange}
                />
              }
              onPlayerNameChange={handlePlayerNameChange}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onReorderPlayers={handleReorderPlayers}
              onTimeLimitChange={setTimeLimit}
              onSpyCountChange={setSpyCount}
              onHideSpyCountChange={setHideSpyCount}
              onBack={() => router.push("/")}
              onStart={handleStart}
            />
          </section>

          <section className={cn(shellClassName, "p-6")}>
            <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  <Compass className="size-3.5" />
                  Included Locations
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  See exactly what can appear
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  {source.kind === "collection"
                    ? "This preview shows the exact locations in the selected collection, so saved role lists stay visible before the round starts."
                    : "This preview updates instantly as categories change, so pass-and-play no longer hides the actual location pool behind a blind start button."}
                </p>
              </div>
              <Link
                href={source.kind === "collection" ? "/collections" : "/library"}
                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950"
              >
                <BookOpen className="size-4" />
                {source.kind === "collection" ? "Open collection" : "Open library"}
              </Link>
            </div>

            <div className="mt-5">
              <LocationCatalogPreview
                locations={previewLocations}
                emptyTitle={
                  collectionDetailQuery.isLoading
                    ? "Loading collection preview"
                    : "No locations are available yet"
                }
                emptyDescription={
                  source.kind === "collection"
                    ? "Pick another collection or create one from the Library."
                    : "Choose at least one category to include locations in this round."
                }
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
