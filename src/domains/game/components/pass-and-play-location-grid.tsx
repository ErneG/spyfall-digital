"use client";

import { MapPin } from "lucide-react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";

import type { LocationInfo } from "@/domains/game/schema";

interface PassAndPlayLocationGridProps {
  locations: LocationInfo[];
  prevLocationName: string | null;
}

/** Static location reference grid for pass-and-play. No highlighting, no interaction. */
export const PassAndPlayLocationGrid = memo(function PassAndPlayLocationGrid({
  locations,
  prevLocationName,
}: PassAndPlayLocationGridProps) {
  const { t, translateLocation } = useTranslation();

  return (
    <div className="bg-surface-1 rounded-2xl p-4">
      <p className="text-muted-foreground/60 mb-3 text-[11px] tracking-[0.08em] uppercase">
        <MapPin className="mr-1 inline h-3 w-3" />
        {t.locationGrid.title} ({locations.length})
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {locations.map((loc) => {
          const isPrevious = prevLocationName === loc.name;
          return (
            <div
              key={loc.id}
              className={`rounded-xl px-3 py-2 text-left text-xs ${
                isPrevious
                  ? "bg-surface-2 text-muted-foreground/60 line-through opacity-50"
                  : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {translateLocation(loc.name)}
            </div>
          );
        })}
      </div>
    </div>
  );
});
