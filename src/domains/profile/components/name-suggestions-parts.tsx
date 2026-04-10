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
      className="rounded-full border border-white/70 bg-white/72 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-950"
    >
      {name}
    </button>
  );
});
