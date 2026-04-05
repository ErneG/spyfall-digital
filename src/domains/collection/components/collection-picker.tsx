"use client";

import { BookOpen } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { getCollections, importCollectionToRoom } from "../actions";

import type { CollectionListItem } from "../schema";

interface CollectionPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  playerId: string;
  onImported: () => void;
}

export const CollectionPicker = memo(function CollectionPicker({
  open,
  onOpenChange,
  roomCode,
  playerId,
  onImported,
}: CollectionPickerProps) {
  const { isAuthenticated } = useAuth();
  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !isAuthenticated) {
      return;
    }
    setLoading(true);
    getCollections().then((result) => {
      if (result.success) {
        setCollections(result.data);
      }
      setLoading(false);
    });
  }, [open, isAuthenticated]);

  const handleImport = useCallback(
    async (collectionId: string) => {
      setImporting(collectionId);
      const result = await importCollectionToRoom({ collectionId, roomCode, playerId });
      if (result.success) {
        onImported();
        onOpenChange(false);
      }
      setImporting(null);
    },
    [roomCode, playerId, onImported, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Collection</DialogTitle>
          <DialogDescription>
            Choose a collection to import its locations into this room.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="bg-surface-2 size-6 animate-pulse rounded-full" />
          </div>
        ) : collections.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No collections yet. Create one from your profile.
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {collections.map((c) => (
              <CollectionPickerRow
                key={c.id}
                collection={c}
                onImport={handleImport}
                isImporting={importing === c.id}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

// ─── Row ─────────────────────────────────────────────────────

interface CollectionPickerRowProps {
  collection: CollectionListItem;
  onImport: (id: string) => void;
  isImporting: boolean;
}

const CollectionPickerRow = memo(function CollectionPickerRow({
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
