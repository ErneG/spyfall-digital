"use client";

import { BookOpen } from "lucide-react";
import { memo, useCallback } from "react";

import type { CollectionListItem } from "../schema";

interface CollectionPickerRowProps {
  collection: CollectionListItem;
  onImport: (id: string) => Promise<void>;
  isImporting: boolean;
}

export const CollectionPickerRow = memo(function CollectionPickerRow({
  collection,
  onImport,
  isImporting,
}: CollectionPickerRowProps) {
  const handleClick = useCallback(() => {
    void onImport(collection.id);
  }, [onImport, collection.id]);

  return (
    <button
      onClick={handleClick}
      disabled={isImporting}
      className="flex w-full items-center gap-3 rounded-[24px] border border-white/80 bg-white/80 p-4 text-left shadow-[0_18px_45px_rgba(148,163,184,0.12)] transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-50"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-teal-700">
        <BookOpen className="size-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-950">{collection.name}</p>
        <p className="mt-1 text-xs text-slate-500">
          {collection.locationCount} location{collection.locationCount !== 1 ? "s" : ""}
        </p>
      </div>
      <span className="text-xs font-medium text-slate-500">
        {isImporting ? "Importing…" : "Import"}
      </span>
    </button>
  );
});
