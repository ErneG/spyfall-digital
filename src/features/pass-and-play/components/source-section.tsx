"use client";

import { BookMarked, Layers3 } from "lucide-react";

import { type CollectionListItem } from "@/entities/library/collection";
import { type ContentSourceInput } from "@/entities/library/content-source";
import { type LocationCategory } from "@/shared/config/location-catalog";
import { cn } from "@/shared/lib/utils";
import { CategoryPicker } from "@/shared/ui/category-picker";
import { Label } from "@/shared/ui/label";

interface PassAndPlaySourceSectionProps {
  collections: CollectionListItem[];
  isAuthenticated: boolean;
  isLoadingCollections: boolean;
  source: ContentSourceInput;
  onSourceChange: (source: ContentSourceInput) => void;
}

const tabClassName =
  "flex-1 rounded-[24px] border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200";

export function PassAndPlaySourceSection({
  collections,
  isAuthenticated,
  isLoadingCollections,
  source,
  onSourceChange,
}: PassAndPlaySourceSectionProps) {
  const hasCollections = collections.length > 0;
  const selectedCollection =
    source.kind === "collection"
      ? (collections.find((collection) => collection.id === source.collectionId) ?? null)
      : null;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-950">Source</h3>
        <p className="text-sm leading-6 text-slate-500">
          Choose whether this round should draw from the built-in catalog or one of your Library
          collections.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={cn(
            tabClassName,
            source.kind === "built-in"
              ? "border-sky-200 bg-sky-50"
              : "border-white/70 bg-white/72 hover:bg-white",
          )}
          onClick={() =>
            onSourceChange({
              kind: "built-in",
              categories: source.kind === "built-in" ? source.categories : [],
            })
          }
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Layers3 className="size-4" />
            Built-in catalog
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Start from the seeded catalog and filter by category before the round begins.
          </p>
        </button>

        <button
          type="button"
          disabled={!isAuthenticated || !hasCollections || isLoadingCollections}
          className={cn(
            tabClassName,
            source.kind === "collection"
              ? "border-sky-200 bg-sky-50"
              : "border-white/70 bg-white/72 hover:bg-white",
            "disabled:cursor-not-allowed disabled:opacity-45",
          )}
          onClick={() => {
            if (!hasCollections) {
              return;
            }
            onSourceChange({
              kind: "collection",
              collectionId: source.kind === "collection" ? source.collectionId : collections[0].id,
            });
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <BookMarked className="size-4" />
            Collection
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Reuse one of your curated Library collections so custom locations and roles are playable
            in pass-and-play.
          </p>
        </button>
      </div>

      {source.kind === "built-in" ? (
        <div className="rounded-[28px] border border-white/70 bg-white/72 p-4">
          <CategoryPicker
            categories={source.categories}
            onChange={(categories) =>
              onSourceChange({
                kind: "built-in",
                categories: categories as LocationCategory[],
              })
            }
          />
        </div>
      ) : (
        <div className="space-y-2 rounded-[28px] border border-white/70 bg-white/72 p-4">
          <Label htmlFor="pass-and-play-collection">Collection</Label>
          <select
            id="pass-and-play-collection"
            className="h-12 w-full rounded-2xl border border-white/75 bg-white px-4 text-sm text-slate-950 transition outline-none focus:border-sky-300 focus:ring-3 focus:ring-sky-200"
            value={source.collectionId}
            onChange={(event) =>
              onSourceChange({
                kind: "collection",
                collectionId: event.target.value,
              })
            }
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          <p className="text-xs leading-5 text-slate-500">
            {hasCollections
              ? "Use a collection when you want the exact saved locations and role lists you already curated."
              : isAuthenticated
                ? "Create a collection from the Library to use it here."
                : "Sign in to use your Library collections in pass-and-play."}
          </p>
          {selectedCollection ? (
            <p className="text-xs font-medium text-slate-600">
              {selectedCollection.locationCount} locations ready for this round
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
