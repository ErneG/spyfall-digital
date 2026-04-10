"use client";

import React, { useCallback } from "react";

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
      className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
        isSelected
          ? "border-slate-950 bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)]"
          : "border-white/70 bg-white/72 text-slate-600 hover:bg-white hover:text-slate-950"
      }`}
    >
      {label}
    </button>
  );
});
