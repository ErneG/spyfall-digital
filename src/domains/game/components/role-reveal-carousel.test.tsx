import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { I18nProvider } from "@/shared/i18n/context";

import { RoleRevealCarousel } from "./role-reveal-carousel";

vi.mock("@/domains/game/hooks", () => ({
  fetchPlayerRole: vi.fn(),
}));

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

const { fetchPlayerRole } = await import("@/domains/game/hooks");

afterEach(cleanup);

describe("RoleRevealCarousel", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("shows an explicit retry button after a role fetch failure", async () => {
    vi.mocked(fetchPlayerRole).mockResolvedValue(null);
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <RoleRevealCarousel
          gameId="game-1"
          players={[{ id: "player-1", name: "Avery" }]}
          onComplete={vi.fn()}
        />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: /i'm avery/i }));
    await user.click(
      screen.getByRole("button", { name: /avery tap below to see your role classified/i }),
    );

    expect(screen.getByText(/failed to load role/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
