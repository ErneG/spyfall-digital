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
      className={`rounded-xl px-3 py-2 text-[12px] font-medium transition-colors ${
        active
          ? "bg-spy-purple/12 text-spy-purple"
          : "bg-surface-2 text-muted-foreground hover:bg-surface-3"
      }`}
    >
      {translateCategory(label)}
    </button>
  );
});
