"use client";

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

import { CollectionPickerRow } from "./collection-picker-parts";

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
    let cancelled = false;
    const loadCollections = async () => {
      setLoading(true);
      const result = await getCollections();
      if (cancelled) {
        return;
      }
      if (result.success) {
        setCollections(result.data);
      }
      setLoading(false);
    };
    void loadCollections();
    return () => {
      cancelled = true;
    };
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
      <DialogContent className="border-white/80 bg-white/82 shadow-[0_32px_90px_rgba(148,163,184,0.22)] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-950">Import Collection</DialogTitle>
          <DialogDescription className="text-slate-500">
            Choose a collection to import its locations into this room.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="size-6 animate-pulse rounded-full bg-slate-200" />
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-950">No collections yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create one from the collections area, then import it here.
            </p>
          </div>
        ) : (
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
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
