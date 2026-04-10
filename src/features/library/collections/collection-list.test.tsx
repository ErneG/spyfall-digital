import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CollectionListView } from "./collection-list";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace,
  }),
}));

vi.mock("@/domains/auth/hooks", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/domains/collection/actions", () => ({
  createCollection: vi.fn(),
  deleteCollection: vi.fn(),
  getCollections: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: [],
    }),
  ),
}));

vi.mock("./collection-list-parts", () => ({
  CollectionCard: () => <div>Collection card</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CollectionListView", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
  });

  it("returns to the library instead of home when the user goes back", async () => {
    const user = userEvent.setup();

    render(<CollectionListView />);

    await screen.findByText(/no collections yet/i);
    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(push).toHaveBeenCalledWith("/library");
  });
});
