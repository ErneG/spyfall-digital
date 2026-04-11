"use client";

import { MapPin } from "lucide-react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";

import type { LocationInfo } from "./schema";

interface PassAndPlayLocationGridProps {
  locations: LocationInfo[];
  prevLocationName: string | null;
}

export const PassAndPlayLocationGrid = memo(function PassAndPlayLocationGrid({
  locations,
  prevLocationName,
}: PassAndPlayLocationGridProps) {
  const { t, translateLocation } = useTranslation();

  return (
    <div className="rounded-[28px] border border-white/80 bg-white/76 p-4 shadow-[0_18px_40px_rgba(148,163,184,0.16)] backdrop-blur-xl">
      <p className="mb-3 text-[11px] tracking-[0.08em] text-slate-500 uppercase">
        <MapPin className="mr-1 inline h-3 w-3" />
        {t.locationGrid.title} ({locations.length})
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {locations.map((location) => {
          const isPrevious = prevLocationName === location.name;
          return (
            <div
              key={location.id}
              className={`rounded-xl px-3 py-2 text-left text-xs ${
                isPrevious
                  ? "bg-slate-100 text-slate-400 line-through opacity-60"
                  : "bg-white text-slate-600"
              }`}
            >
              {translateLocation(location.name)}
            </div>
          );
        })}
      </div>
    </div>
  );
});
