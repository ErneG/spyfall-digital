"use client";

import { GripVertical, Plus, X } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import React, { useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/shared/lib/constants";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { type PlayerEntry, usePlayerList } from "./use-player-list";

/* ── Hooks ──────────────────────────────────────────── */

function usePlayerRowHandlers(
  entryId: string,
  onNameChange: (id: string, value: string) => void,
  onRemove: (id: string) => void,
) {
  const controls = useDragControls();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onNameChange(entryId, event.target.value),
    [entryId, onNameChange],
  );
  const handleRemove = useCallback(() => onRemove(entryId), [entryId, onRemove]);
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => controls.start(event),
    [controls],
  );
  return { controls, handleChange, handleRemove, handlePointerDown };
}

/* ── Player name row ─────────────────────────────────── */

const PlayerNameRow = React.memo(function PlayerNameRow({
  entry,
  index,
  canRemove,
  onNameChange,
  onRemove,
  inputRef,
  onEnter,
}: {
  entry: PlayerEntry;
  index: number;
  canRemove: boolean;
  onNameChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  inputRef: React.RefCallback<HTMLInputElement>;
  onEnter: (index: number) => void;
}) {
  const { t } = useTranslation();
  const { controls, handleChange, handleRemove, handlePointerDown } = usePlayerRowHandlers(
    entry.id,
    onNameChange,
    onRemove,
  );
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onEnter(index);
      }
    },
    [index, onEnter],
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
        ref={inputRef}
        placeholder={`${t.home.playerN} ${index + 1}`}
        value={entry.name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
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
  const { entries, makeInputRef, handleEnter, handleReorder, handleNameChange, handleRemove } =
    usePlayerList({
      playerNames,
      onPlayerNameChange,
      onAddPlayer,
      onRemovePlayer,
      onReorderPlayers,
    });

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
            inputRef={makeInputRef(index)}
            onEnter={handleEnter}
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
