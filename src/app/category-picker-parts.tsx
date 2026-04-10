"use client";

import { memo, useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";

export const CategoryChip = memo(function CategoryChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: (category: string) => void;
}) {
  const { translateCategory } = useTranslation();
  const handleClick = useCallback(() => {
    onToggle(label);
  }, [onToggle, label]);

  return (
    <button
      onClick={handleClick}
      className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition-colors ${
        active
          ? "border-teal-200 bg-teal-50 text-teal-800"
          : "border-white/70 bg-white/72 text-slate-600 hover:bg-white hover:text-slate-950"
      }`}
    >
      {translateCategory(label)}
    </button>
  );
});
