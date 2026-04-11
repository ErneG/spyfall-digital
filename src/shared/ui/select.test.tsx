import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Select, SelectTrigger, SelectValue } from "./select";

describe("Select", () => {
  it("uses the light glass trigger styles by default", () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Choose a source" />
        </SelectTrigger>
      </Select>,
    );

    expect(screen.getByTestId("select-trigger").className).toContain("bg-white/78");
  });
});
