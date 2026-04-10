import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LibraryPageClient } from "./library-page-client";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/library/use-saved-locations", () => ({
  useSavedLocations: () => ({
    error: "",
    isAuthenticated: false,
    isDeleting: false,
    isLoading: false,
    isSaving: false,
    locations: [],
    onDelete: vi.fn(),
    onSave: vi.fn(),
  }),
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

afterEach(cleanup);

describe("LibraryPageClient", () => {
  it("describes collections as a current capability instead of an upcoming system", () => {
    render(<LibraryPageClient />);

    expect(
      screen.getByText(/reuse them across pass-and-play and collections/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/upcoming collection system/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/first real content-management slice/i)).not.toBeInTheDocument();
  });
});
