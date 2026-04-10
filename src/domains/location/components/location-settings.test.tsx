import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LocationSettings } from "./location-settings";

vi.mock("@/shared/i18n/context", () => ({
  useTranslation: () => ({
    t: {
      common: {
        cancel: "Cancel",
        save: "Save",
      },
      config: {
        locationsSelected: "locations selected",
      },
      locationSettings: {
        description: "Adjust the built-in pool and any room-only custom locations.",
        title: "Advanced room customization",
      },
    },
  }),
}));

vi.mock("@/shared/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("./use-location-data", () => ({
  useLocationData: () => ({
    customLocations: [{ id: "custom-1", selected: true }],
    handleSave: vi.fn(),
    isLoading: false,
    locations: [{ id: "built-in-1", category: "Test", name: "Terminal", selected: true }],
  }),
}));

vi.mock("./location-settings-body", () => ({
  LocationSettingsBody: () => <div>Location settings body</div>,
}));

vi.mock("./location-settings-parts", () => ({
  LocationFilterInput: () => <div>Location filter input</div>,
}));

describe("LocationSettings", () => {
  it("keeps advanced room customization focused on room-local editing", () => {
    render(<LocationSettings open onOpenChange={vi.fn()} roomCode="ABCDE" playerId="player-1" />);

    expect(
      screen.getByText("Advanced room customization (2 locations selected)"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /import from collection/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Location settings body")).toBeInTheDocument();
  });
});
