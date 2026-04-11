"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { getCollections, importCollectionToRoom } from "../actions";

import { CollectionPickerRow } from "./collection-picker-row";

import type { CollectionListItem } from "../schema";

interface CollectionPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  playerId: string;
  onImported: () => void;
}

export function CollectionPicker({
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
  let content;

  useEffect(() => {
    let cancelled = false;

    const loadCollections = async () => {
      if (!open || !isAuthenticated) {
        return;
      }

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

  if (loading) {
    content = (
      <div className="flex justify-center py-8">
        <div className="bg-surface-2 size-6 animate-pulse rounded-full" />
      </div>
    );
  } else if (collections.length === 0) {
    content = (
      <p className="text-muted-foreground py-6 text-center text-sm">
        No collections yet. Create one from your profile.
      </p>
    );
  } else {
    content = (
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
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Collection</DialogTitle>
          <DialogDescription>
            Choose a collection to import its locations into this room.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
