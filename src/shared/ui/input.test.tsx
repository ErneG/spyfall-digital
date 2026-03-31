import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach } from "vitest";

import { Input } from "./input";

afterEach(cleanup);

describe("Input", () => {
  it("renders an input element", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
  });

  it("sets data-slot attribute", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("accepts text type", () => {
    const { container } = render(<Input type="text" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "text");
  });

  it("accepts password type", () => {
    const { container } = render(<Input type="password" />);
    expect(container.querySelector("input")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("handles user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    await user.type(input, "Hello World");
    expect(input).toHaveValue("Hello World");
  });

  it("shows placeholder text", () => {
    render(<Input placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    const { container } = render(<Input disabled />);
    expect(container.querySelector("input")).toBeDisabled();
  });

  it("applies custom className", () => {
    const { container } = render(<Input className="my-class" />);
    expect(container.querySelector("input")?.className).toContain("my-class");
  });

  it("calls onChange handler", async () => {
    const user = userEvent.setup();
    const values: string[] = [];
    render(
      <Input
        placeholder="change-test"
        onChange={(e) => {
          values.push(e.target.value);
        }}
      />,
    );
    await user.type(screen.getByPlaceholderText("change-test"), "ab");
    expect(values).toContain("a");
    expect(values).toContain("ab");
  });
});
