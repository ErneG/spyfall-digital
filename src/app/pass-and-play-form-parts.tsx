"use client";

import { Reorder, useDragControls } from "motion/react";
import { GripVertical, Plus, X } from "lucide-react";
import React, { useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/shared/lib/constants";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

/* ── Types ───────────────────────────────────────────── */

interface PlayerEntry {
  id: string;
  name: string;
}

/* ── Player name row ─────────────────────────────────── */

const PlayerNameRow = React.memo(function PlayerNameRow({
  entry,
  index,
  canRemove,
  onNameChange,
  onRemove,
}: {
  entry: PlayerEntry;
  index: number;
  canRemove: boolean;
  onNameChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation();
  const controls = useDragControls();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onNameChange(entry.id, event.target.value),
    [entry.id, onNameChange],
  );
  const handleRemove = useCallback(() => onRemove(entry.id), [entry.id, onRemove]);
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => controls.start(event),
    [controls],
  );

  return (
    <Reorder.Item
      value={entry}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2"
      style={{ position: "relative" }}
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", zIndex: 10 }}
    >
      <button
        type="button"
        onPointerDown={handlePointerDown}
        className="text-muted-foreground/40 hover:text-muted-foreground shrink-0 cursor-grab touch-none active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        placeholder={`${t.home.playerN} ${index + 1}`}
        value={entry.name}
        onChange={handleChange}
        maxLength={20}
        className="bg-surface-1 placeholder:text-muted-foreground/60 h-[48px] rounded-xl border-transparent text-[15px] focus:border-transparent"
      />
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground shrink-0"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Reorder.Item>
  );
});

/* ── Player list section ─────────────────────────────── */

export interface PlayerListSectionProps {
  playerNames: string[];
  onPlayerNameChange: (index: number, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onReorderPlayers: (newNames: string[]) => void;
}

export const PlayerListSection = React.memo(function PlayerListSection({
  playerNames,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  onReorderPlayers,
}: PlayerListSectionProps) {
  const { t } = useTranslation();

  // Stable entries: id is set once per session position, name is the live value.
  // We use a stable ref-based id so Reorder can track items across renders.
  const entries: PlayerEntry[] = playerNames.map((name, i) => ({
    id: `player-${String(i)}`,
    name,
  }));

  const handleReorder = useCallback(
    (reordered: PlayerEntry[]) => {
      onReorderPlayers(reordered.map((e) => e.name));
    },
    [onReorderPlayers],
  );

  const handleNameChange = useCallback(
    (id: string, value: string) => {
      const index = entries.findIndex((e) => e.id === id);
      if (index !== -1) onPlayerNameChange(index, value);
    },
    [entries, onPlayerNameChange],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const index = entries.findIndex((e) => e.id === id);
      if (index !== -1) onRemovePlayer(index);
    },
    [entries, onRemovePlayer],
  );

  return (
    <>
      <Reorder.Group
        axis="y"
        values={entries}
        onReorder={handleReorder}
        className="space-y-2"
        style={{ listStyle: "none", padding: 0, margin: 0 }}
      >
        {entries.map((entry, index) => (
          <PlayerNameRow
            key={entry.id}
            entry={entry}
            index={index}
            canRemove={playerNames.length > MIN_PLAYERS}
            onNameChange={handleNameChange}
            onRemove={handleRemove}
          />
        ))}
      </Reorder.Group>
      {playerNames.length < MAX_PLAYERS && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground w-full gap-1"
          onClick={onAddPlayer}
        >
          <Plus className="h-4 w-4" /> {t.home.addPlayer}
        </Button>
      )}
    </>
  );
});
