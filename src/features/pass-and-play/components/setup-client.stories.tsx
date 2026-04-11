import { Sparkles } from "lucide-react";
import Link from "next/link";
import { fn } from "storybook/test";

import {
  createBuiltInContentSource,
  type ContentSourceInput,
} from "@/entities/library/content-source";
import { DEFAULT_LOCATIONS } from "@/entities/library/default-locations";
import { type PlayerDraft } from "@/features/pass-and-play/player-drafts";
import { LOCATION_CATEGORIES } from "@/shared/config/location-catalog";
import { LocationCatalogPreview } from "@/shared/ui/location-catalog-preview";

import { PassAndPlayForm } from "./form";
import { PassAndPlaySourceSection } from "./source-section";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Pass & Play/Setup",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const playerDrafts = [
  { id: "player-1", name: "Avery" },
  { id: "player-2", name: "Jordan" },
  { id: "player-3", name: "Casey" },
  { id: "player-4", name: "Morgan" },
] satisfies PlayerDraft[];

const collectionOptions = [
  {
    id: "collection-1",
    name: "Underworld",
    description: "Mafia-coded rooms and cover stories",
    locationCount: 5,
    createdAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "collection-2",
    name: "Embassies",
    description: "Diplomatic pressure and intelligence leaks",
    locationCount: 3,
    createdAt: "2026-04-09T10:00:00.000Z",
  },
];

const reviewLocations = DEFAULT_LOCATIONS.filter((location) =>
  ["Entertainment", "Transportation", "Workplace"].includes(location.category),
).slice(0, 8);

function PassAndPlaySetupReviewSurface({ source }: { source: ContentSourceInput }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3f8] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.55)_30%,transparent_54%),radial-gradient(circle_at_85%_18%,rgba(191,219,254,0.55),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.44),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 transition hover:bg-white"
            >
              <Sparkles className="size-3.5" />
              Home
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 transition hover:bg-white"
            >
              Library
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              Private setup, one shared device
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Build the round before anyone starts peeking.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              This setup flow keeps pass-and-play self-contained: players, round settings, source
              filtering, and a full preview of the included location list before the game starts.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
            <PassAndPlayForm
              players={playerDrafts}
              timeLimit={480}
              spyCount={1}
              hideSpyCount={false}
              error=""
              isLoading={false}
              sourceSection={
                <PassAndPlaySourceSection
                  collections={collectionOptions}
                  isAuthenticated
                  isLoadingCollections={false}
                  source={source}
                  onSourceChange={fn()}
                />
              }
              onPlayerNameChange={fn()}
              onAddPlayer={fn()}
              onRemovePlayer={fn()}
              onReorderPlayers={fn()}
              onTimeLimitChange={fn()}
              onSpyCountChange={fn()}
              onHideSpyCountChange={fn()}
              onBack={fn()}
              onStart={fn()}
            />
          </section>

          <section className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  <Sparkles className="size-3.5" />
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
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/75 bg-white/72 p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    Players
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {playerDrafts.length}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/75 bg-white/72 p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    Locations
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {reviewLocations.length}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/75 bg-white/72 p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    Roles
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {reviewLocations.reduce((sum, location) => sum + location.roles.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/80 bg-white/72 p-4">
              <LocationCatalogPreview
                locations={reviewLocations}
                emptyTitle="No locations matched this source"
                emptyDescription="Broaden the filters or pick a different collection."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export const BuiltInSetup: Story = {
  render: () => (
    <PassAndPlaySetupReviewSurface source={createBuiltInContentSource([...LOCATION_CATEGORIES])} />
  ),
};

export const CollectionBackedSetup: Story = {
  render: () => (
    <PassAndPlaySetupReviewSurface source={{ kind: "collection", collectionId: "collection-1" }} />
  ),
};
