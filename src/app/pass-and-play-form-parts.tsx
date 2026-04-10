"use client";

import { GripVertical, Plus, X } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import React, { useCallback } from "react";

import { type PlayerDraft } from "@/features/pass-and-play/player-drafts";
import { useTranslation } from "@/shared/i18n/context";
import { MIN_PLAYERS, MAX_PLAYERS } from "@/shared/lib/constants";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { usePlayerList } from "./use-player-list";

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
  entry: PlayerDraft;
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
        className="shrink-0 cursor-grab touch-none text-slate-400 hover:text-slate-600 active:cursor-grabbing"
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
        className="h-[48px] rounded-2xl border border-white/70 bg-white/76 text-[15px] text-slate-950 placeholder:text-slate-400 focus:border-sky-300 focus-visible:ring-sky-200"
      />
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-slate-500 hover:bg-slate-900/5"
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
  players: PlayerDraft[];
  onPlayerNameChange: (id: string, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (id: string) => void;
  onReorderPlayers: (players: PlayerDraft[]) => void;
}

export const PlayerListSection = React.memo(function PlayerListSection({
  players,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  onReorderPlayers,
}: PlayerListSectionProps) {
  const { t } = useTranslation();
  const { entries, makeInputRef, handleEnter, handleReorder, handleNameChange, handleRemove } =
    usePlayerList({
      players,
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
            canRemove={players.length > MIN_PLAYERS}
            onNameChange={handleNameChange}
            onRemove={handleRemove}
            inputRef={makeInputRef(index)}
            onEnter={handleEnter}
          />
        ))}
      </Reorder.Group>
      {players.length < MAX_PLAYERS && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1 rounded-2xl border border-dashed border-slate-300/90 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-950"
          onClick={onAddPlayer}
        >
          <Plus className="h-4 w-4" /> {t.home.addPlayer}
        </Button>
      )}
    </>
  );
});
