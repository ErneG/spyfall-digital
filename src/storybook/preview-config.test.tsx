import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import preview, { renderInStorybookShell } from "../../.storybook/preview";

type StorybookPreviewParameters = NonNullable<typeof preview.parameters> & {
  a11y?: { test?: "error" | "off" | "todo" };
  backgrounds?: { default?: string };
};

describe("storybook preview", () => {
  it("uses the light app shell and strict accessibility checks", () => {
    const parameters = preview.parameters as StorybookPreviewParameters;
    expect(parameters.backgrounds?.default).toBe("app");
    expect(parameters.a11y?.test).toBe("error");

    const view = renderInStorybookShell(<div data-testid="story-content">Story</div>);
    const { container } = render(view);

    const shell = screen.getByTestId("storybook-shell");
    expect(shell).toHaveClass("bg-[#eef3f8]");
    expect(container.querySelector(".dark")).toBeNull();
    expect(screen.getByTestId("story-content")).toBeInTheDocument();
  });
});
