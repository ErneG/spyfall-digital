"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookMarked } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { applyRoomContentSource } from "@/domains/room/actions";
import { createCollectionContentSource } from "@/entities/library/content-source";
import { roomKeys } from "@/entities/room/query";
import { useLibraryCollections } from "@/features/library/use-library-collections";
import { unwrapAction } from "@/shared/lib/unwrap-action";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

interface RoomSourceCollectionPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  playerId: string;
}

export const RoomSourceCollectionPicker = memo(function RoomSourceCollectionPicker({
  open,
  onOpenChange,
  roomCode,
  playerId,
}: RoomSourceCollectionPickerProps) {
  const queryClient = useQueryClient();
  const { collections, error, isAuthenticated, isLoading } = useLibraryCollections();
  const [actionError, setActionError] = useState<string | null>(null);
  const normalizedRoomCode = useMemo(() => roomCode.toUpperCase(), [roomCode]);

  const sourceMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      const result = await applyRoomContentSource({
        roomCode,
        playerId,
        source: createCollectionContentSource(collectionId),
      });

      return unwrapAction(result);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roomKeys.state(normalizedRoomCode),
      });
      onOpenChange(false);
      setActionError(null);
    },
    onError: (caughtError) => {
      setActionError(caughtError.message);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setActionError(null);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="border-white/80 bg-white/82 shadow-[0_32px_90px_rgba(148,163,184,0.22)] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-950">Import from Library</DialogTitle>
          <DialogDescription className="text-slate-500">
            Replace the active room pool with a saved collection snapshot from your Library.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="size-6 animate-pulse rounded-full bg-slate-200" />
          </div>
        ) : !isAuthenticated ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-950">
              Sign in to import Library collections.
            </p>
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-950">No Library collections yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create one in the Library, then import it here as the room source.
            </p>
          </div>
        ) : (
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {collections.map((collection) => {
              const isImporting =
                sourceMutation.isPending && sourceMutation.variables === collection.id;

              return (
                <div
                  key={collection.id}
                  className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.12)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <BookMarked className="size-4" />
                        {collection.name}
                      </div>
                      <p className="text-xs leading-5 text-slate-500">
                        {collection.locationCount} locations ready to replace the current room pool.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full border border-slate-950/5 bg-slate-950 px-4 text-white hover:bg-slate-900"
                      onClick={() => {
                        setActionError(null);
                        sourceMutation.mutate(collection.id);
                      }}
                      disabled={sourceMutation.isPending}
                    >
                      {isImporting ? "Importing…" : "Import"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error ? <p className="text-sm text-[color:var(--spy-red)]">{error}</p> : null}
        {actionError ? <p className="text-sm text-[color:var(--spy-red)]">{actionError}</p> : null}
      </DialogContent>
    </Dialog>
  );
});
