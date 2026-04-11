import { BookOpen, ChevronLeft, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DEFAULT_LOCATIONS } from "@/entities/library/default-locations";
import { SavedLocationManager } from "@/features/library/components/saved-location-manager";
import { LIBRARY_COLLECTIONS_ROUTE } from "@/features/library/routes";
import { LOCATION_CATEGORIES } from "@/shared/config/location-catalog";
import { CategoryPicker } from "@/shared/ui/category-picker";
import { Input } from "@/shared/ui/input";
import { LocationCatalogPreview } from "@/shared/ui/location-catalog-preview";

import { StatCard } from "./library-page-parts";

import type { SavedLocationItem } from "@/features/library/schema";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Library/Library Page",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const savedLocations = [
  {
    id: "saved-location-1",
    name: "Nightclub Office",
    category: "Entertainment",
    allSpies: false,
    roles: [
      { id: "role-1", name: "Club Owner" },
      { id: "role-2", name: "Bookkeeper" },
      { id: "role-3", name: "Doorman" },
    ],
    updatedAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "saved-location-2",
    name: "Safe House",
    category: "Transportation",
    allSpies: true,
    roles: [],
    updatedAt: "2026-04-08T09:30:00.000Z",
  },
] satisfies SavedLocationItem[];

const previewLocations = DEFAULT_LOCATIONS.filter((location) =>
  ["Entertainment", "Transportation", "Workplace"].includes(location.category),
).slice(0, 8);

const collections = [
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
] satisfies Array<{
  id: string;
  name: string;
  description: string | null;
  locationCount: number;
  createdAt: string;
}>;

function LibraryPageReviewSurface() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([...LOCATION_CATEGORIES]);

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return previewLocations.filter((location) => {
      if (!categories.includes(location.category)) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return (
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.category.toLowerCase().includes(normalizedQuery) ||
        location.roles.some((role) => role.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [categories, query]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3f8] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.6)_30%,transparent_54%),radial-gradient(circle_at_85%_14%,rgba(191,219,254,0.55),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.42),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 transition hover:bg-white"
            >
              <ChevronLeft className="size-3.5" />
              Home
            </Link>
            <Link
              href={LIBRARY_COLLECTIONS_ROUTE}
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 transition hover:bg-white"
            >
              <BookOpen className="size-3.5" />
              Collections
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              Built-in catalog and saved content
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Browse locations, preview collections, and author saved role lists.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Storybook now shows the whole library surface together so the catalog, saved
              locations, and collection affordances can be reviewed in one place.
            </p>
          </div>
        </header>

        <section className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-sky-900 uppercase">
                <Sparkles className="size-3.5" />
                Authoring
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Save custom locations with proper role editing.
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                Create saved locations with explicit role rows, keep your custom role lists tidy,
                and reuse them anywhere the app supports your library.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Saved" value={String(savedLocations.length)} />
              <StatCard
                label="Saved roles"
                value={String(
                  savedLocations.reduce((sum, location) => sum + location.roles.length, 0),
                )}
              />
              <StatCard label="Collections" value={String(collections.length)} />
            </div>
          </div>

          <div className="mt-5">
            <SavedLocationManager
              error={null}
              isDeleting={false}
              isLoading={false}
              isSaving={false}
              locations={savedLocations}
              onDelete={() => undefined}
              onSave={(input) => ({
                id: input.id ?? "saved-location-story",
                name: input.name,
                category: input.category,
                allSpies: input.allSpies,
                roles: input.roles.map((role, index) => ({
                  id: `saved-location-role-${String(index)}`,
                  name: role,
                })),
                updatedAt: "2026-04-11T12:00:00.000Z",
              })}
            />
          </div>
        </section>

        <section className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <label className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search locations, categories, or roles"
                className="h-12 rounded-2xl border border-white/75 bg-white/78 pl-11 text-slate-950 placeholder:text-slate-400"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Shown" value={String(filteredLocations.length)} />
              <StatCard label="Categories" value={String(LOCATION_CATEGORIES.length)} />
              <StatCard
                label="Roles"
                value={String(
                  filteredLocations.reduce((sum, location) => sum + location.roles.length, 0),
                )}
              />
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-white/80 bg-white/72 p-4">
            <CategoryPicker categories={categories} onChange={setCategories} />
          </div>

          <div className="mt-5">
            <LocationCatalogPreview
              locations={filteredLocations}
              emptyTitle="Nothing matched that filter"
              emptyDescription="Try a broader search or re-enable one of the categories."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export const Overview: Story = {
  render: () => <LibraryPageReviewSurface />,
};
