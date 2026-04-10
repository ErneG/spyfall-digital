"use client";

import { useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";
import { applyRoomContentSource } from "@/domains/room/actions";
import { createCollectionContentSource } from "@/entities/library/content-source";
import { roomKeys } from "@/entities/room/query";
import { unwrapAction } from "@/shared/lib/unwrap-action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { getCollections } from "../actions";

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
  const queryClient = useQueryClient();
  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState("");

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

  const handleUse = useCallback(
    async (collectionId: string) => {
      setError("");
      setImporting(collectionId);
      try {
        const result = await applyRoomContentSource({
          roomCode,
          playerId,
          source: createCollectionContentSource(collectionId),
        });
        unwrapAction(result);
        await queryClient.invalidateQueries({ queryKey: roomKeys.state(roomCode) });
        onImported();
        onOpenChange(false);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : "Failed to update room source",
        );
      } finally {
        setImporting(null);
      }
    },
    [onImported, onOpenChange, playerId, queryClient, roomCode],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/80 bg-white/82 shadow-[0_32px_90px_rgba(148,163,184,0.22)] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-950">Use a Library Collection</DialogTitle>
          <DialogDescription className="text-slate-500">
            Choose a collection to replace this room&apos;s active location pool with one of your
            saved Library snapshots.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <div className="rounded-[20px] border border-[#b5454f]/18 bg-[#b5454f]/8 px-4 py-3 text-sm text-[#8b2f3a]">
            {error}
          </div>
        ) : null}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="size-6 animate-pulse rounded-full bg-slate-200" />
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-950">No collections yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create one from the Library, then use it here.
            </p>
          </div>
        ) : (
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {collections.map((c) => (
              <CollectionPickerRow
                key={c.id}
                collection={c}
                onUse={handleUse}
                isImporting={importing === c.id}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});
