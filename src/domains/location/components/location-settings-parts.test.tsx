import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomLocationEditorCard } from "./location-settings-parts";

afterEach(cleanup);

describe("CustomLocationEditorCard", () => {
  it("submits explicit role rows for a new custom location", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<CustomLocationEditorCard mode="create" onCancel={onCancel} onSave={onSave} />);

    await user.type(screen.getByLabelText(/location name/i), "Secret Lab");
    await user.type(screen.getByRole("textbox", { name: /role 1/i }), "Scientist");
    await user.click(screen.getByRole("button", { name: /add role/i }));
    await user.type(screen.getByRole("textbox", { name: /role 2/i }), "Guard");
    await user.click(screen.getByRole("button", { name: /^save custom location$/i }));

    expect(onSave).toHaveBeenCalledWith({
      allSpies: false,
      name: "Secret Lab",
      roles: ["Scientist", "Guard"],
    });
  });

  it("loads an existing location and allows saving it as all-spies without roles", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <CustomLocationEditorCard
        mode="edit"
        initialLocation={{
          id: "custom-1",
          name: "Dead Drop",
          allSpies: false,
          selected: true,
          roles: [{ id: "role-1", name: "Courier" }],
        }}
        onCancel={() => undefined}
        onSave={onSave}
      />,
    );

    expect(screen.getByDisplayValue("Dead Drop")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Courier")).toBeInTheDocument();

    await user.click(screen.getByRole("switch", { name: /all spies/i }));
    await user.click(screen.getByRole("button", { name: /^save changes$/i }));

    expect(onSave).toHaveBeenCalledWith({
      allSpies: true,
      id: "custom-1",
      name: "Dead Drop",
      roles: [],
    });
  });
});
