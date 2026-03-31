import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("1C1C1E");
  });

  it("renders with secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge.className).toContain("2C2C2E");
  });

  it("renders with destructive variant", () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText("Destructive");
    expect(badge.className).toContain("EF4444");
  });

  it("renders with outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge.className).toContain("border");
  });

  it("applies custom className", () => {
    render(<Badge className="my-custom">Custom</Badge>);
    expect(screen.getByText("Custom").className).toContain("my-custom");
  });

  it("renders as a span by default", () => {
    render(<Badge>Span</Badge>);
    const badge = screen.getByText("Span");
    expect(badge.tagName).toBe("SPAN");
  });
});
