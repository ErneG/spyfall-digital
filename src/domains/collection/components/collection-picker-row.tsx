"use client";

import { BookOpen } from "lucide-react";
import { memo, useCallback } from "react";

import type { CollectionListItem } from "../schema";

interface CollectionPickerRowProps {
  collection: CollectionListItem;
  onImport: (id: string) => void;
  isImporting: boolean;
}

export const CollectionPickerRow = memo(function CollectionPickerRow({
  collection,
  onImport,
  isImporting,
}: CollectionPickerRowProps) {
  const handleClick = useCallback(() => onImport(collection.id), [onImport, collection.id]);

  return (
    <button
      onClick={handleClick}
      disabled={isImporting}
      className="bg-surface-1 hover:bg-surface-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors disabled:opacity-50"
    >
      <BookOpen className="size-4 shrink-0 text-[#8B5CF6]" />
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{collection.name}</p>
        <p className="text-muted-foreground text-xs">
          {collection.locationCount} location{collection.locationCount !== 1 ? "s" : ""}
        </p>
      </div>
      <span className="text-muted-foreground text-xs">
        {isImporting ? "Importing..." : "Import"}
      </span>
    </button>
  );
});
