import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LibraryPageClient } from "./library-page-client";

const { useSavedLocations, useLibraryCollections } = vi.hoisted(() => ({
  useSavedLocations: vi.fn(),
  useLibraryCollections: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/library/use-saved-locations", () => ({
  useSavedLocations,
}));

vi.mock("@/features/library/use-library-collections", () => ({
  useLibraryCollections,
}));

vi.mock("@/shared/ui/category-picker", () => ({
  CategoryPicker: () => <div>Category picker</div>,
}));

vi.mock("@/shared/ui/location-catalog-preview", () => ({
  LocationCatalogPreview: () => <div>Location preview</div>,
}));

vi.mock("@/features/library/components/saved-location-manager", () => ({
  SavedLocationManager: () => <div>Saved location manager</div>,
}));

afterEach(() => {
  cleanup();
  useSavedLocations.mockReset();
  useLibraryCollections.mockReset();
});

function mockLibraryState(overrides?: {
  savedLocations?: Partial<ReturnType<typeof useSavedLocations>>;
  collections?: Partial<ReturnType<typeof useLibraryCollections>>;
}) {
  useSavedLocations.mockReturnValue({
    error: "",
    isAuthenticated: false,
    isDeleting: false,
    isLoading: false,
    isSaving: false,
    locations: [],
    onDelete: vi.fn(),
    onSave: vi.fn(),
    ...overrides?.savedLocations,
  });

  useLibraryCollections.mockReturnValue({
    collections: [
      { id: "collection-1", name: "Starter Pack", description: null, locationCount: 3 },
      { id: "collection-2", name: "Night Shift", description: null, locationCount: 5 },
    ],
    error: null,
    isAuthenticated: true,
    isLoading: false,
    ...overrides?.collections,
  });
}

describe("LibraryPageClient", () => {
  it("describes collections as a current capability instead of an upcoming system", () => {
    mockLibraryState();

    render(<LibraryPageClient />);

    expect(
      screen.getByText(/reuse them across pass-and-play and collections/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/upcoming collection system/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/first real content-management slice/i)).not.toBeInTheDocument();
  });

  it("offers a direct link into collections from the library authoring area", () => {
    mockLibraryState();

    render(<LibraryPageClient />);

    expect(screen.getByRole("link", { name: /open collections/i })).toHaveAttribute(
      "href",
      "/library/collections",
    );
  });

  it("surfaces collection count alongside saved-location stats", () => {
    mockLibraryState();

    render(<LibraryPageClient />);

    expect(screen.getByText("Collections")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows a neutral access check while the saved-location auth state is still loading", () => {
    mockLibraryState({
      savedLocations: {
        isAuthenticated: false,
        isLoading: true,
      },
    });

    render(<LibraryPageClient />);

    expect(screen.getByText(/checking your library access/i)).toBeInTheDocument();
    expect(screen.queryByText("Saved location manager")).not.toBeInTheDocument();
  });
});
