"use client";

import React, { useCallback } from "react";

/* ── Preset button ───────────────────────────────────── */

export const PnPPresetButton = React.memo(function PnPPresetButton({
  label,
  value,
  isSelected,
  onClick,
}: {
  label: string;
  value: number;
  isSelected: boolean;
  onClick: (value: number) => void;
}) {
  const handleClick = useCallback(() => onClick(value), [onClick, value]);
  return (
    <button
      onClick={handleClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
        isSelected ? "bg-white text-black" : "bg-[#141414] text-[#8E8E93] hover:bg-[#1C1C1E]"
      }`}
    >
      {label}
    </button>
  );
});
