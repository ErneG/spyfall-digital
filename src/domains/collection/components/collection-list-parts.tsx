"use client";

import { BookOpen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";

import { Button } from "@/shared/ui/button";

import type { CollectionListItem } from "../schema";

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
    router.push(`/collections/${collection.id}`);
  }, [router, collection.id]);

  const handleDelete = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      void onDelete(collection.id);
    },
    [onDelete, collection.id],
  );

  return (
    <button
      onClick={handleClick}
      className="bg-surface-1 hover:bg-surface-2 flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#8B5CF6]/12">
        <BookOpen className="size-5 text-[#8B5CF6]" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{collection.name}</p>
        <p className="text-muted-foreground text-xs">
          {collection.locationCount} location{collection.locationCount !== 1 ? "s" : ""}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleDelete}
        aria-label={`Delete ${collection.name}`}
      >
        <Trash2 className="text-muted-foreground size-3.5" />
      </Button>
    </button>
  );
});
