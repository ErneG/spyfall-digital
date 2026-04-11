"use client";

import { Trash2 } from "lucide-react";
import { memo, useCallback } from "react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import type { CollectionLocationItem } from "../schema";

interface CollectionEditorLocationRowProps {
  location: CollectionLocationItem;
  onRemove: (id: string) => void;
}

export const CollectionEditorLocationRow = memo(function CollectionEditorLocationRow({
  location,
  onRemove,
}: CollectionEditorLocationRowProps) {
  const handleRemove = useCallback(() => onRemove(location.id), [onRemove, location.id]);

  return (
    <div className="bg-surface-1 flex items-center gap-3 rounded-xl p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{location.name}</span>
          {location.allSpies && <Badge variant="destructive">All Spies</Badge>}
        </div>
        <p className="text-muted-foreground text-xs">
          {location.roles.map((r) => r.name).join(", ")}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleRemove}
        aria-label={`Remove ${location.name}`}
      >
        <Trash2 className="text-muted-foreground size-3.5" />
      </Button>
    </div>
  );
});
