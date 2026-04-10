import { useCallback, useEffect, useMemo, useRef, useState, type RefCallback } from "react";

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
    (index: number): RefCallback<HTMLInputElement> =>
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
  const [entryIds, setEntryIds] = useState(() =>
    playerNames.map((_, index) => `player-${String(index)}`),
  );

  useEffect(() => {
    setEntryIds((currentIds) => {
      if (currentIds.length === playerNames.length) {
        return currentIds;
      }
      if (currentIds.length > playerNames.length) {
        return currentIds.slice(0, playerNames.length);
      }
      const nextIds = [...currentIds];
      while (nextIds.length < playerNames.length) {
        nextIds.push(`player-${String(nextIdRef.current++)}`);
      }
      return nextIds;
    });
  }, [playerNames.length]);

  const entries: PlayerEntry[] = useMemo(
    () =>
      playerNames.map((name, index) => ({
        id: entryIds[index] ?? `player-missing-${String(index)}`,
        name,
      })),
    [entryIds, playerNames],
  );

  // ── Handlers (translate stable IDs back to indices) ─
  const handleReorder = useCallback(
    (reordered: PlayerEntry[]) => {
      setEntryIds(reordered.map((entry) => entry.id));
      onReorderPlayers(reordered.map((entry) => entry.name));
    },
    [onReorderPlayers],
  );

  const handleNameChange = useCallback(
    (id: string, value: string) => {
      const index = entryIds.indexOf(id);
      if (index !== -1) {
        onPlayerNameChange(index, value);
      }
    },
    [entryIds, onPlayerNameChange],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const index = entryIds.indexOf(id);
      if (index !== -1) {
        setEntryIds((currentIds) => currentIds.filter((_, currentIndex) => currentIndex !== index));
        onRemovePlayer(index);
      }
    },
    [entryIds, onRemovePlayer],
  );

  return { entries, makeInputRef, handleEnter, handleReorder, handleNameChange, handleRemove };
}
