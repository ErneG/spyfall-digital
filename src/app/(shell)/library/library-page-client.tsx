"use client";

import { BookOpen, ChevronLeft, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DEFAULT_LOCATIONS } from "@/domains/location/data";
import { SavedLocationManager } from "@/features/library/components/saved-location-manager";
import { useLibraryCollections } from "@/features/library/use-library-collections";
import { useSavedLocations } from "@/features/library/use-saved-locations";
import { LOCATION_CATEGORIES } from "@/shared/config/location-catalog";
import { cn } from "@/shared/lib/utils";
import { CategoryPicker } from "@/shared/ui/category-picker";
import { Input } from "@/shared/ui/input";
import { LocationCatalogPreview } from "@/shared/ui/location-catalog-preview";

import { StatCard } from "./library-page-parts";

const shellClassName =
  "rounded-[34px] border border-white/80 bg-white/66 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl";

export function LibraryPageClient() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([...LOCATION_CATEGORIES]);
  const { collections } = useLibraryCollections();
  const { error, isAuthenticated, isDeleting, isLoading, isSaving, locations, onDelete, onSave } =
    useSavedLocations();

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return DEFAULT_LOCATIONS.filter((location) => {
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

  const savedRoleCount = useMemo(
    () => locations.reduce((sum, location) => sum + location.roles.length, 0),
    [locations],
  );

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#eef3f8] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.6)_30%,transparent_54%),radial-gradient(circle_at_85%_14%,rgba(191,219,254,0.55),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.42),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className={cn(shellClassName, "space-y-5 p-6")}>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 transition hover:bg-white"
            >
              <ChevronLeft className="size-3.5" />
              Home
            </Link>
            <Link
              href="/play/pass-and-play"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 transition hover:bg-white"
            >
              <BookOpen className="size-3.5" />
              Pass &amp; Play setup
            </Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              Built-in catalog
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Browse every location before the game starts.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              The library is now a first-class surface. Search the built-in catalog, filter by
              category, and inspect every role list without having to open a room first.
            </p>
          </div>
        </header>

        <section className={cn(shellClassName, "space-y-5 p-6")}>
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
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950"
              >
                <BookOpen className="size-4" />
                Open collections
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Saved" value={String(locations.length)} />
              <StatCard label="Saved roles" value={String(savedRoleCount)} />
              <StatCard label="Collections" value={String(collections.length)} />
            </div>
          </div>

          {isLoading || isAuthenticated ? (
            <SavedLocationManager
              error={error}
              isDeleting={isDeleting}
              isLoading={isLoading}
              isSaving={isSaving}
              locations={locations}
              onDelete={onDelete}
              onSave={onSave}
            />
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/68 px-6 py-12 text-center">
              <h3 className="text-xl font-semibold text-slate-950">
                Sign in to save your own locations
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                The built-in catalog is open to everyone, and saved locations stay with your account
                so you can reuse them across pass-and-play and collections.
              </p>
            </div>
          )}
        </section>

        <section className={cn(shellClassName, "space-y-5 p-6")}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <label className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search locations, categories, or roles"
                className="h-12 rounded-2xl border border-white/75 bg-white/78 pl-11 text-slate-950 placeholder:text-slate-400"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Shown" value={String(filteredLocations.length)} />
              <StatCard label="Categories" value={String(categories.length)} />
              <StatCard
                label="Roles"
                value={String(
                  filteredLocations.reduce((sum, location) => sum + location.roles.length, 0),
                )}
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-white/8 pt-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
              Built-in catalog
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Preview every seeded location before the round starts.
            </h2>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/72 p-4">
            <CategoryPicker categories={categories} onChange={setCategories} />
          </div>

          <LocationCatalogPreview
            locations={filteredLocations}
            emptyTitle="Nothing matched that filter"
            emptyDescription="Try a broader search or re-enable one of the categories."
          />
        </section>
      </div>
    </main>
  );
}
