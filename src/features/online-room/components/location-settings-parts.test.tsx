import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomLocationRow } from "./location-settings-parts";

afterEach(cleanup);

describe("CustomLocationRow", () => {
  it("keeps imported room-source locations selectable without inline editing controls", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <CustomLocationRow
        location={{
          id: "custom-1",
          name: "Dead Drop",
          allSpies: false,
          selected: true,
          roles: [{ id: "role-1", name: "Courier" }],
        }}
        onToggle={onToggle}
      />,
    );

    await user.click(screen.getByRole("switch"));

    expect(onToggle).toHaveBeenCalledWith("custom-1", false);
    expect(screen.queryByRole("button", { name: /edit dead drop/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete dead drop/i })).not.toBeInTheDocument();
  });
});
