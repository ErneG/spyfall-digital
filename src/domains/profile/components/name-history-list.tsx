"use client";

import { memo } from "react";

import { NameHistoryRow } from "./name-history-list-parts";

import type { NameHistoryItem } from "../schema";

interface NameHistoryListProps {
  names: NameHistoryItem[];
  onDelete: (name: string) => void;
  isDeleting: boolean;
}

export const NameHistoryList = memo(function NameHistoryList({
  names,
  onDelete,
  isDeleting,
}: NameHistoryListProps) {
  if (names.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        No names used yet. Play a game to build your history!
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {names.map((item) => (
        <NameHistoryRow key={item.id} item={item} onDelete={onDelete} isDeleting={isDeleting} />
      ))}
    </ul>
  );
});
