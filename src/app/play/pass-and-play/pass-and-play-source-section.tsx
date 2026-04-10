"use client";

import { BookMarked, Layers3 } from "lucide-react";

import { CategoryPicker } from "@/app/category-picker";
import { type CollectionListItem } from "@/domains/collection/schema";
import { type PassAndPlaySourceInput } from "@/domains/room/schema";
import { type LocationCategory } from "@/shared/config/location-catalog";
import { cn } from "@/shared/lib/utils";
import { Label } from "@/shared/ui/label";

interface PassAndPlaySourceSectionProps {
  collections: CollectionListItem[];
  isAuthenticated: boolean;
  isLoadingCollections: boolean;
  source: PassAndPlaySourceInput;
  onSourceChange: (source: PassAndPlaySourceInput) => void;
}

const tabClassName =
  "flex-1 rounded-[22px] border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30";

export function PassAndPlaySourceSection({
  collections,
  isAuthenticated,
  isLoadingCollections,
  source,
  onSourceChange,
}: PassAndPlaySourceSectionProps) {
  const hasCollections = collections.length > 0;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-white">Source</h3>
        <p className="text-sm leading-6 text-white/55">
          Choose whether this round should draw from the built-in catalog or one of your saved
          collections.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={cn(
            tabClassName,
            source.kind === "built-in"
              ? "border-cyan-300/35 bg-cyan-300/10"
              : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
          )}
          onClick={() =>
            onSourceChange({
              kind: "built-in",
              categories: source.kind === "built-in" ? source.categories : [],
            })
          }
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Layers3 className="size-4" />
            Built-in catalog
          </div>
          <p className="mt-2 text-xs leading-5 text-white/55">
            Start from the seeded catalog and filter by category before the round begins.
          </p>
        </button>

        <button
          type="button"
          disabled={!isAuthenticated || !hasCollections || isLoadingCollections}
          className={cn(
            tabClassName,
            source.kind === "collection"
              ? "border-cyan-300/35 bg-cyan-300/10"
              : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
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
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BookMarked className="size-4" />
            Saved collection
          </div>
          <p className="mt-2 text-xs leading-5 text-white/55">
            Reuse one of your curated collections so custom locations and roles are playable in
            pass-and-play.
          </p>
        </button>
      </div>

      {source.kind === "built-in" ? (
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
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
        <div className="space-y-2 rounded-[24px] border border-white/8 bg-black/20 p-4">
          <Label htmlFor="pass-and-play-collection">Collection</Label>
          <select
            id="pass-and-play-collection"
            className="h-12 w-full rounded-xl border border-white/10 bg-[#141414] px-4 text-sm text-white transition outline-none focus:border-cyan-300/40 focus:ring-3 focus:ring-cyan-300/15"
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
          <p className="text-xs leading-5 text-white/50">
            {hasCollections
              ? "Collections are imported as curated snapshots, so your saved role lists stay intact."
              : isAuthenticated
                ? "Create a collection from the Library to use it here."
                : "Sign in to use your saved collections in pass-and-play."}
          </p>
        </div>
      )}
    </section>
  );
}
