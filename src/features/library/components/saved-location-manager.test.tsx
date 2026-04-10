import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SavedLocationManager } from "./saved-location-manager";

afterEach(cleanup);

describe("SavedLocationManager", () => {
  it("renders existing saved locations and lets the user select one", async () => {
    const user = userEvent.setup();

    render(
      <SavedLocationManager
        locations={[
          {
            id: "saved-1",
            name: "Secret Lab",
            category: "Education & Science",
            allSpies: false,
            updatedAt: "2026-04-10T12:00:00.000Z",
            roles: [
              { id: "role-1", name: "Scientist" },
              { id: "role-2", name: "Guard" },
            ],
          },
          {
            id: "saved-2",
            name: "Cruise Ship",
            category: "Transportation",
            allSpies: false,
            updatedAt: "2026-04-10T11:00:00.000Z",
            roles: [{ id: "role-3", name: "Captain" }],
          },
        ]}
        onDelete={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /secret lab/i })).toBeInTheDocument();
    expect(screen.getByText(/scientist/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cruise ship/i }));

    expect(screen.getByDisplayValue("Cruise Ship")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Captain")).toBeInTheDocument();
  });

  it("creates a new saved location from the editor form", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<SavedLocationManager locations={[]} onDelete={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText(/location name/i), "Harbor Control");
    await user.selectOptions(screen.getByLabelText(/category/i), "Transportation");
    await user.type(screen.getByLabelText(/role 1/i), "Controller");
    await user.type(screen.getByLabelText(/role 2/i), "Dock Worker");
    await user.click(screen.getByRole("button", { name: /^save location$/i }));

    expect(onSave).toHaveBeenCalledWith({
      name: "Harbor Control",
      category: "Transportation",
      allSpies: false,
      roles: ["Controller", "Dock Worker"],
    });
  });

  it("supports all-spies saved locations without requiring roles", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<SavedLocationManager locations={[]} onDelete={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText(/location name/i), "Undercover Briefing");
    await user.click(screen.getByRole("switch", { name: /all spies/i }));
    await user.click(screen.getByRole("button", { name: /^save location$/i }));

    expect(onSave).toHaveBeenCalledWith({
      name: "Undercover Briefing",
      category: "Transportation",
      allSpies: true,
      roles: [],
    });
  });
});
