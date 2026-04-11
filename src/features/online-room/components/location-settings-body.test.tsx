import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LocationSettingsBody } from "./location-settings-body";

vi.mock("@/shared/i18n/context", () => ({
  useTranslation: () => ({
    t: {
      common: {
        loading: "Loading",
      },
      locationSettings: {
        customLocations: "Imported room source",
      },
    },
  }),
}));

vi.mock("./location-settings-parts", () => ({
  CategoryGroupSection: () => <div>Category group</div>,
  CustomLocationRow: ({ location }: { location: { name: string } }) => <div>{location.name}</div>,
}));

describe("LocationSettingsBody", () => {
  it("guides hosts back to the Library instead of offering room-only authoring", () => {
    render(
      <LocationSettingsBody
        categories={[]}
        filter=""
        data={
          {
            customLocations: [
              {
                id: "custom-1",
                name: "Night Market",
                allSpies: false,
                selected: true,
                roles: [{ id: "role-1", name: "Courier" }],
              },
            ],
            deselectAllCategory: vi.fn(),
            handleSave: vi.fn(),
            isLoading: false,
            locations: [],
            refetch: vi.fn(),
            selectAllCategory: vi.fn(),
            toggleCustomLocation: vi.fn(),
            toggleLocation: vi.fn(),
          } as never
        }
      />,
    );

    expect(screen.getByText("Imported room source")).toBeInTheDocument();
    expect(screen.getByText(/manage durable custom content in the library/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open library collections/i })).toHaveAttribute(
      "href",
      "/library/collections",
    );
    expect(screen.queryByRole("button", { name: /add/i })).not.toBeInTheDocument();
  });
});
