import React, { useCallback, useMemo, useRef } from "react";

import { MAX_PLAYERS } from "@/shared/lib/constants";

export interface PlayerEntry {
  id: string;
  name: string;
}

interface UsePlayerListOptions {
  playerNames: string[];
  onPlayerNameChange: (index: number, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onReorderPlayers: (newNames: string[]) => void;
}

export function usePlayerList({
  playerNames,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  onReorderPlayers,
}: UsePlayerListOptions) {
  // ── Input focus management ──────────────────────────
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const makeInputRef = useCallback(
    (index: number): React.RefCallback<HTMLInputElement> =>
      (el) => {
        if (el) {
          inputRefs.current.set(index, el);
        } else {
          inputRefs.current.delete(index);
        }
      },
    [],
  );

  const handleEnter = useCallback(
    (index: number) => {
      const next = inputRefs.current.get(index + 1);
      if (next) {
        next.focus();
      } else if (index + 1 < MAX_PLAYERS) {
        onAddPlayer();
        requestAnimationFrame(() => {
          inputRefs.current.get(index + 1)?.focus();
        });
      }
    },
    [onAddPlayer],
  );

  // ── Stable IDs for Motion Reorder tracking ──────────
  const nextIdRef = useRef(playerNames.length);
  const idsRef = useRef<string[]>(playerNames.map((_, i) => `player-${String(i)}`));

  if (idsRef.current.length < playerNames.length) {
    while (idsRef.current.length < playerNames.length) {
      idsRef.current.push(`player-${String(nextIdRef.current++)}`);
    }
  } else if (idsRef.current.length > playerNames.length) {
    idsRef.current = idsRef.current.slice(0, playerNames.length);
  }

  const entries: PlayerEntry[] = useMemo(
    () => playerNames.map((name, i) => ({ id: idsRef.current[i], name })),
    [playerNames],
  );

  // ── Handlers (translate stable IDs back to indices) ─
  const handleReorder = useCallback(
    (reordered: PlayerEntry[]) => {
      idsRef.current = reordered.map((e) => e.id);
      onReorderPlayers(reordered.map((e) => e.name));
    },
    [onReorderPlayers],
  );

  const handleNameChange = useCallback(
    (id: string, value: string) => {
      const index = idsRef.current.indexOf(id);
      if (index !== -1) {
        onPlayerNameChange(index, value);
      }
    },
    [onPlayerNameChange],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const index = idsRef.current.indexOf(id);
      if (index !== -1) {
        idsRef.current.splice(index, 1);
        onRemovePlayer(index);
      }
    },
    [onRemovePlayer],
  );

  return { entries, makeInputRef, handleEnter, handleReorder, handleNameChange, handleRemove };
}
