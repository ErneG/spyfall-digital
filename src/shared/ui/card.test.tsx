import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";

afterEach(cleanup);

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("sets data-slot attribute", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstElementChild).toHaveAttribute("data-slot", "card");
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="custom">Content</Card>);
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("supports sm size variant", () => {
    const { container } = render(<Card size="sm">Content</Card>);
    expect(container.firstElementChild).toHaveAttribute("data-size", "sm");
  });
});

describe("CardHeader", () => {
  it("renders and has correct slot", () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect(container.firstElementChild).toHaveAttribute("data-slot", "card-header");
  });
});

describe("CardTitle", () => {
  it("renders title text", () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("has correct data-slot", () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect(container.firstElementChild).toHaveAttribute("data-slot", "card-title");
  });
});

describe("CardDescription", () => {
  it("renders description text", () => {
    render(<CardDescription>Description here</CardDescription>);
    expect(screen.getByText("Description here")).toBeInTheDocument();
  });

  it("has correct data-slot", () => {
    const { container } = render(<CardDescription>Description</CardDescription>);
    expect(container.firstElementChild).toHaveAttribute("data-slot", "card-description");
  });
});

describe("CardContent", () => {
  it("renders content", () => {
    render(<CardContent>Content here</CardContent>);
    expect(screen.getByText("Content here")).toBeInTheDocument();
  });

  it("has correct data-slot", () => {
    const { container } = render(<CardContent>Content</CardContent>);
    expect(container.firstElementChild).toHaveAttribute("data-slot", "card-content");
  });
});

describe("CardFooter", () => {
  it("renders footer", () => {
    render(<CardFooter>Footer here</CardFooter>);
    expect(screen.getByText("Footer here")).toBeInTheDocument();
  });

  it("has correct data-slot", () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    expect(container.firstElementChild).toHaveAttribute("data-slot", "card-footer");
  });
});

describe("Card composition", () => {
  it("renders a full card with all sub-components", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});
