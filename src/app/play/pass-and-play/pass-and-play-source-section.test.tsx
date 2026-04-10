import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PassAndPlaySourceSection } from "./pass-and-play-source-section";

vi.mock("@/app/category-picker", () => ({
  CategoryPicker: () => <div>Category picker</div>,
}));

afterEach(cleanup);

describe("PassAndPlaySourceSection", () => {
  it("switches to the first available collection source", async () => {
    const user = userEvent.setup();
    const onSourceChange = vi.fn();

    render(
      <PassAndPlaySourceSection
        collections={[
          {
            id: "collection-1",
            name: "Starter Pack",
            description: null,
            locationCount: 3,
            createdAt: "2026-04-10T10:00:00.000Z",
          },
        ]}
        isAuthenticated
        isLoadingCollections={false}
        source={{ kind: "built-in", categories: ["Transportation"] }}
        onSourceChange={onSourceChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /saved collection/i }));

    expect(onSourceChange).toHaveBeenCalledWith({
      kind: "collection",
      collectionId: "collection-1",
    });
  });

  it("lets the user choose a different collection when collection mode is active", async () => {
    const user = userEvent.setup();
    const onSourceChange = vi.fn();

    render(
      <PassAndPlaySourceSection
        collections={[
          {
            id: "collection-1",
            name: "Starter Pack",
            description: null,
            locationCount: 3,
            createdAt: "2026-04-10T10:00:00.000Z",
          },
          {
            id: "collection-2",
            name: "Night Shift",
            description: null,
            locationCount: 5,
            createdAt: "2026-04-10T11:00:00.000Z",
          },
        ]}
        isAuthenticated
        isLoadingCollections={false}
        source={{ kind: "collection", collectionId: "collection-1" }}
        onSourceChange={onSourceChange}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/collection/i), "collection-2");

    expect(onSourceChange).toHaveBeenCalledWith({
      kind: "collection",
      collectionId: "collection-2",
    });
  });
});
