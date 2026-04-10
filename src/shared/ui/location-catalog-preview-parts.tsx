import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";

import type { LocationCatalogItem } from "./location-catalog-preview";

interface LocationCatalogGroupProps {
  category: string;
  locations: LocationCatalogItem[];
}

export function LocationCatalogGroup({ category, locations }: LocationCatalogGroupProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{category}</h3>
        <span className="text-xs text-white/45">
          {locations.length} location{locations.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-3">
        {locations.map((location) => (
          <LocationCatalogCard key={`${location.category}-${location.name}`} location={location} />
        ))}
      </div>
    </section>
  );
}

function LocationCatalogCard({ location }: { location: LocationCatalogItem }) {
  return (
    <article className="rounded-3xl border border-white/8 bg-white/[0.04] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-white">{location.name}</h4>
          <p className="mt-1 text-sm text-white/55">
            {location.roles.length} role{location.roles.length === 1 ? "" : "s"}
          </p>
        </div>
        <Badge variant="secondary" className="border-white/10 bg-white/6 text-white/70">
          {location.category}
        </Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {location.roles.map((role) => (
          <span
            key={`${location.name}-${role}`}
            className={cn(
              "rounded-full border border-white/8 px-3 py-1 text-xs font-medium text-white/70",
              "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]",
            )}
          >
            {role}
          </span>
        ))}
      </div>
    </article>
  );
}
