"use client";

import { memo, useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";

import { getNameSuggestions } from "../actions";

import { NameChip } from "./name-suggestions-parts";

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
    let cancelled = false;

    async function loadNameSuggestions() {
      const result = await getNameSuggestions();
      if (!cancelled && result.success) {
        setNames(result.data);
      }
    }

    void loadNameSuggestions();

    return () => {
      cancelled = true;
    };
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
