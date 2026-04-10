import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SourceSection } from "./game-config-sections";

vi.mock("@/shared/i18n/context", () => ({
  useTranslation: () => ({
    t: {
      config: {
        advancedRoomCustomization: "Advanced room customization",
        builtInCatalog: "Built-in catalog",
        collection: "Collection",
        collectionImportHint: "Switch this room to one of your saved Library collections.",
        importCollection: "Use Collection",
        locationsSelected: "locations selected",
        signInForCollections: "Sign in to use Library collections.",
        source: "Source",
      },
    },
  }),
}));

afterEach(() => {
  cleanup();
});

describe("SourceSection", () => {
  it("renders built-in and collection source actions for authenticated hosts", async () => {
    const user = userEvent.setup();
    const openBuiltIn = vi.fn();
    const openCollection = vi.fn();

    render(
      <SourceSection
        canImportCollections
        selectedLocationCount={12}
        totalLocationCount={54}
        onOpenBuiltIn={openBuiltIn}
        onOpenCollection={openCollection}
      />,
    );

    expect(screen.getByText("Built-in catalog")).toBeInTheDocument();
    expect(screen.getByText("12 / 54 locations selected")).toBeInTheDocument();
    expect(screen.getByText("Collection")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Advanced room customization" }));
    await user.click(screen.getByRole("button", { name: "Use Collection" }));

    expect(openBuiltIn).toHaveBeenCalledOnce();
    expect(openCollection).toHaveBeenCalledOnce();
  });

  it("disables collection import when the host is not signed in", () => {
    render(
      <SourceSection
        canImportCollections={false}
        selectedLocationCount={12}
        totalLocationCount={54}
        onOpenBuiltIn={vi.fn()}
        onOpenCollection={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Use Collection" })).toBeDisabled();
    expect(screen.getByText("Sign in to use Library collections.")).toBeInTheDocument();
  });
});
