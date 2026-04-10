import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddLocationForm, SavedLocationImportList } from "./collection-editor-parts";

afterEach(cleanup);

describe("SavedLocationImportList", () => {
  it("shows importable saved locations and skips ones already in the collection", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();

    render(
      <SavedLocationImportList
        existingLocationNames={["Cruise Ship"]}
        importingId={null}
        onImport={onImport}
        savedLocations={[
          {
            id: "saved-1",
            name: "Secret Lab",
            category: "Education & Science",
            allSpies: false,
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
            roles: [{ id: "role-3", name: "Captain" }],
          },
        ]}
      />,
    );

    expect(screen.getByText("Secret Lab")).toBeInTheDocument();
    expect(screen.getByText("Scientist, Guard")).toBeInTheDocument();
    expect(screen.getByText("Already added")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /import secret lab/i }));

    expect(onImport).toHaveBeenCalledWith("saved-1");
  });
});

describe("AddLocationForm", () => {
  it("submits explicit role rows as a normalized role list", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);

    render(<AddLocationForm onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add location/i }));
    await user.type(screen.getByLabelText(/location name/i), "Secret Lab");
    await user.type(screen.getByRole("textbox", { name: /role 1/i }), "Scientist");
    await user.click(screen.getByRole("button", { name: /add role/i }));
    await user.type(screen.getByRole("textbox", { name: /role 2/i }), "Guard");
    await user.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith("Secret Lab", ["Scientist", "Guard"], false);
  });

  it("allows all-spies locations without role rows", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);

    render(<AddLocationForm onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add location/i }));
    await user.type(screen.getByLabelText(/location name/i), "Dead Drop");
    await user.click(screen.getByRole("switch", { name: /all spies/i }));
    await user.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith("Dead Drop", [], true);
  });
});
