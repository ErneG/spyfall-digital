"use client";

import { memo, useCallback, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";

import { getNameSuggestions } from "../actions";

interface NameSuggestionsProps {
  onSelect: (name: string) => void;
}

export const NameSuggestions = memo(function NameSuggestions({ onSelect }: NameSuggestionsProps) {
  const { isAuthenticated } = useAuth();
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    void getNameSuggestions().then((result) => {
      if (result.success) {
        setNames(result.data);
      }
    });
  }, [isAuthenticated]);

  if (!isAuthenticated || names.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((name) => (
        <NameChip key={name} name={name} onSelect={onSelect} />
      ))}
    </div>
  );
});

// ─── Chip ────────────────────────────────────────────────────

interface NameChipProps {
  name: string;
  onSelect: (name: string) => void;
}

const NameChip = memo(function NameChip({ name, onSelect }: NameChipProps) {
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
