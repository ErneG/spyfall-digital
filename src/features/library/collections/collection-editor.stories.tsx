import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { fn } from "storybook/test";

import {
  AddLocationForm,
  CollectionLocationRow,
  SavedLocationImportList,
} from "./collection-editor-parts";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Library/Collections/Editor Screen",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const collectionLocations = [
  {
    id: "collection-location-1",
    name: "Nightclub Office",
    allSpies: false,
    roles: [
      { id: "role-1", name: "Owner" },
      { id: "role-2", name: "Bookkeeper" },
      { id: "role-3", name: "Doorman" },
    ],
  },
  {
    id: "collection-location-2",
    name: "Safe House",
    allSpies: true,
    roles: [],
  },
];

const savedLocations = [
  {
    id: "saved-1",
    name: "Nightclub Office",
    category: "Entertainment",
    allSpies: false,
    roles: [
      { id: "saved-role-1", name: "Owner" },
      { id: "saved-role-2", name: "Bookkeeper" },
    ],
  },
  {
    id: "saved-2",
    name: "Witness Route",
    category: "Transportation",
    allSpies: false,
    roles: [
      { id: "saved-role-3", name: "Driver" },
      { id: "saved-role-4", name: "Escort" },
    ],
  },
  {
    id: "saved-3",
    name: "Burner Phone Cache",
    category: "Workplace",
    allSpies: true,
    roles: [],
  },
];

function CollectionEditorReviewSurface() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.62)_26%,transparent_52%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.55),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)] px-4 py-8 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 transition hover:bg-white"
            >
              <ArrowLeft className="size-3.5" />
              Library
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 transition hover:bg-white"
            >
              <BookOpen className="size-3.5" />
              Collections
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              Collection authoring review
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Curate reusable sources with imports and manual entries.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              This screen-level Storybook review keeps the current collection, saved-location
              imports, and collection-only manual entry flow visible together.
            </p>
          </div>
        </header>

        <section className="rounded-[36px] border border-white/80 bg-white/68 p-5 shadow-[0_40px_120px_rgba(148,163,184,0.22)] backdrop-blur-2xl sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/76 shadow-[0_10px_30px_rgba(148,163,184,0.14)]">
              <Sparkles className="size-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Collection editor
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Underworld Rooms
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep your mafia-coded and espionage-heavy rooms together so pass-and-play and online
                rooms can reuse them without rebuilding the same role lists every time.
              </p>
            </div>
          </div>

          <section className="mt-8 space-y-6">
            <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Current locations
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  2 locations in this collection
                </h3>
              </div>

              <div className="mt-5 space-y-3">
                {collectionLocations.map((location) => (
                  <CollectionLocationRow key={location.id} location={location} onRemove={fn()} />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Library imports
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Import from saved locations
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Pull durable saved locations into this pack while preserving the exact role lists.
                </p>
              </div>
              <div className="mt-5">
                <SavedLocationImportList
                  existingLocationNames={collectionLocations.map((location) => location.name)}
                  importingId={null}
                  onImport={fn()}
                  savedLocations={savedLocations}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  Manual entry
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Add a collection-only location
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use a collection-only entry when the location belongs in this pack but not in the
                  user’s broader saved library.
                </p>
              </div>
              <div className="mt-5">
                <AddLocationForm onAdd={() => Promise.resolve(undefined)} />
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

export const Overview: Story = {
  render: () => <CollectionEditorReviewSurface />,
};
