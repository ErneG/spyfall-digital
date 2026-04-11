"use client";

import { BookOpen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";

import { getLibraryCollectionRoute } from "@/features/library/routes";
import { Button } from "@/shared/ui/button";

import type { CollectionListItem } from "@/entities/library/collection";

interface CollectionCardProps {
  collection: CollectionListItem;
  onDelete: (id: string) => Promise<void>;
}

export const CollectionCard = memo(function CollectionCard({
  collection,
  onDelete,
}: CollectionCardProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push(getLibraryCollectionRoute(collection.id));
  }, [router, collection.id]);

  const handleDelete = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      void onDelete(collection.id);
    },
    [onDelete, collection.id],
  );

  return (
    <div className="flex w-full items-center gap-3 rounded-[28px] border border-white/80 bg-white/78 p-4 text-left shadow-[0_18px_45px_rgba(148,163,184,0.12)] transition hover:-translate-y-0.5 hover:bg-white">
      <button onClick={handleClick} className="flex flex-1 items-center gap-3 text-left">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-teal-700">
          <BookOpen className="size-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-950">{collection.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {collection.locationCount} location{collection.locationCount !== 1 ? "s" : ""}
          </p>
        </div>
      </button>
      <Button
        className="rounded-full"
        onClick={handleDelete}
        aria-label={`Delete ${collection.name}`}
        size="icon-sm"
        variant="ghost"
      >
        <Trash2 className="size-3.5 text-slate-400" />
      </Button>
    </div>
  );
});
