"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/domains/auth/hooks";

import { getNameSuggestions } from "../actions";

import { NameChip } from "./name-chip";

interface NameSuggestionsProps {
  onSelect: (name: string) => void;
}

export function NameSuggestions({ onSelect }: NameSuggestionsProps) {
  const { isAuthenticated } = useAuth();
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      return;
    }

    const loadSuggestions = async () => {
      const result = await getNameSuggestions();
      if (cancelled) {
        return;
      }
      if (result.success) {
        setNames(result.data);
      }
    };

    void loadSuggestions();

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
}
