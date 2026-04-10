"use client";

import { Clock, Trash2 } from "lucide-react";
import { memo, useCallback } from "react";

import { Button } from "@/shared/ui/button";

import type { NameHistoryItem } from "@/domains/profile/schema";

interface NameHistoryRowProps {
  item: NameHistoryItem;
  onDelete: (name: string) => void;
  isDeleting: boolean;
}

export const NameHistoryRow = memo(function NameHistoryRow({
  item,
  onDelete,
  isDeleting,
}: NameHistoryRowProps) {
  const handleDelete = useCallback(() => {
    onDelete(item.name);
  }, [onDelete, item.name]);

  const timeAgo = formatRelativeTime(item.usedAt);

  return (
    <li className="hover:bg-surface-2 flex items-center justify-between rounded-lg px-3 py-2 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-950">{item.name}</span>
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <Clock className="size-3" />
          {timeAgo}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`Delete ${item.name}`}
      >
        <Trash2 className="text-muted-foreground size-3.5" />
      </Button>
    </li>
  );
});

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
