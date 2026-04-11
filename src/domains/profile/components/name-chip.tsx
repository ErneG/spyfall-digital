"use client";

import { memo, useCallback } from "react";

interface NameChipProps {
  name: string;
  onSelect: (name: string) => void;
}

export const NameChip = memo(function NameChip({ name, onSelect }: NameChipProps) {
  const handleClick = useCallback(() => {
    onSelect(name);
  }, [name, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-surface-2 text-muted-foreground hover:bg-surface-3 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:text-white"
    >
      {name}
    </button>
  );
});
