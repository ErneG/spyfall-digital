import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardContent, CardFooter } from "./card";

describe("Card", () => {
  it("renders a light glass card shell by default", () => {
    render(
      <Card>
        <CardContent>Body</CardContent>
      </Card>,
    );

    const card = screen.getByText("Body").closest('[data-slot="card"]');
    expect(card?.className).toContain("bg-white/82");
    expect(card?.className).toContain("border-white/80");
  });

  it("renders a light card footer instead of the legacy dark strip", () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    const footer = screen.getByText("Footer").closest('[data-slot="card-footer"]');
    expect(footer?.className).toContain("bg-slate-50/80");
  });
});
