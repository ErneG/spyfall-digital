"use client";

import { memo } from "react";

export const EditionChip = memo(function EditionChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors ${
        active
          ? "bg-spy-purple/12 text-spy-purple"
          : "bg-surface-2 text-muted-foreground hover:bg-surface-3"
      }`}
    >
      {label}
    </button>
  );
});
