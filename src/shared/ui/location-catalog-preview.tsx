import { LocationCatalogGroup } from "./location-catalog-preview-parts";

export interface LocationCatalogItem {
  category: string;
  name: string;
  roles: string[];
}

interface LocationCatalogPreviewProps {
  locations: LocationCatalogItem[];
  emptyDescription?: string;
  emptyTitle?: string;
}

export function LocationCatalogPreview({
  locations,
  emptyTitle = "No locations available",
  emptyDescription = "Adjust the filters to include at least one location.",
}: LocationCatalogPreviewProps) {
  if (locations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center">
        <h3 className="text-lg font-semibold text-white">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-white/55">{emptyDescription}</p>
      </div>
    );
  }

  const groupedLocations = Object.entries(
    locations.reduce<Record<string, LocationCatalogItem[]>>((groups, location) => {
      const current = groups[location.category] ?? [];
      groups[location.category] = [...current, location];
      return groups;
    }, {}),
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, items]) => ({
      category,
      locations: [...items].sort((left, right) => left.name.localeCompare(right.name)),
    }));

  return (
    <div className="space-y-6">
      {groupedLocations.map((group) => (
        <LocationCatalogGroup
          key={group.category}
          category={group.category}
          locations={group.locations}
        />
      ))}
    </div>
  );
}
