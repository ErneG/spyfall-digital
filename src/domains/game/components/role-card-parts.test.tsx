import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { I18nProvider } from "@/shared/i18n/context";

import { RoleCard } from "./role-card-parts";

vi.mock("motion/react", async () => {
  const React = await import("react");

  const createMotionComponent = (tag: "button" | "div") =>
    React.forwardRef<HTMLElement, { children?: React.ReactNode } & Record<string, unknown>>(
      function MotionMock({ children, ...props }, ref) {
        return React.createElement(tag, { ...props, ref }, children as React.ReactNode);
      },
    );

  return {
    motion: {
      button: createMotionComponent("button"),
      div: createMotionComponent("div"),
    },
  };
});

afterEach(cleanup);

describe("RoleCard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the hidden role card as a keyboard-accessible button", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();

    render(
      <I18nProvider>
        <RoleCard
          playerName="Avery"
          role={null}
          isFlipped={false}
          isLoading={false}
          remaining={1}
          onFlip={onFlip}
        />
      </I18nProvider>,
    );

    const revealButton = screen.getByRole("button", {
      name: /avery tap below to see your role classified/i,
    });

    await user.tab();
    expect(revealButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onFlip).toHaveBeenCalledTimes(1);
  });
});
