import { useCallback, useRef, type RefCallback } from "react";

import { type PlayerDraft } from "@/features/pass-and-play/player-drafts";
import { MAX_PLAYERS } from "@/shared/lib/constants";

interface UsePlayerListOptions {
  players: PlayerDraft[];
  onPlayerNameChange: (id: string, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (id: string) => void;
  onReorderPlayers: (players: PlayerDraft[]) => void;
}

export function usePlayerList({
  players,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  onReorderPlayers,
}: UsePlayerListOptions) {
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const makeInputRef = useCallback(
    (index: number): RefCallback<HTMLInputElement> =>
      (element) => {
        if (element) {
          inputRefs.current.set(index, element);
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

  const handleReorder = useCallback(
    (reordered: PlayerDraft[]) => {
      onReorderPlayers(reordered);
    },
    [onReorderPlayers],
  );

  const handleNameChange = useCallback(
    (id: string, value: string) => {
      onPlayerNameChange(id, value);
    },
    [onPlayerNameChange],
  );

  const handleRemove = useCallback(
    (id: string) => {
      onRemovePlayer(id);
    },
    [onRemovePlayer],
  );

  return {
    entries: players,
    makeInputRef,
    handleEnter,
    handleReorder,
    handleNameChange,
    handleRemove,
  };
}
