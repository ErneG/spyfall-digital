import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CollectionCard } from "./collection-list-parts";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("CollectionCard", () => {
  it("keeps the delete control outside the navigation button", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn(() => Promise.resolve());
    const { container } = render(
      <CollectionCard
        collection={{
          id: "collection-1",
          name: "Night Pack",
          description: null,
          locationCount: 3,
          createdAt: "2026-04-11T00:00:00.000Z",
        }}
        onDelete={onDelete}
      />,
    );

    expect(container.querySelector("button button")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Delete Night Pack" }));

    expect(onDelete).toHaveBeenCalledWith("collection-1");
    expect(push).not.toHaveBeenCalled();
  });
});
