import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { I18nProvider } from "@/shared/i18n/context";

const { fetchPlayerRole } = vi.hoisted(() => ({
  fetchPlayerRole: vi.fn(),
}));

vi.mock("./query", () => {
  return {
    fetchPlayerRole,
  };
});

vi.mock("motion/react", async () => {
  const React = await import("react");

  const createMotionComponent = (tag: "button" | "div" | "span") =>
    React.forwardRef<HTMLElement, { children?: React.ReactNode } & Record<string, unknown>>(
      function MotionMock({ children, ...props }, ref) {
        return React.createElement(tag, { ...props, ref }, children as React.ReactNode);
      },
    );

  return {
    motion: {
      button: createMotionComponent("button"),
      div: createMotionComponent("div"),
      span: createMotionComponent("span"),
    },
  };
});

describe("game entity pass-and-play surface", () => {
  it("exports local pass-and-play helpers", async () => {
    const surface = await import("./pass-and-play");

    expect(surface.TimerSection).toBeDefined();
    expect(surface.useExpiryBeep).toEqual(expect.any(Function));
    expect(surface.useGameActions).toEqual(expect.any(Function));
    expect(surface.PassAndPlayLocationGrid).toBeDefined();
    expect(surface.RolePeek).toBeDefined();
    expect(surface.RevealScreen).toBeDefined();
    expect(surface.RoleRevealCarousel).toBeDefined();
  });

  it("renders the entity-owned pass-and-play location grid", async () => {
    const { PassAndPlayLocationGrid } = await import("./pass-and-play");

    render(
      <I18nProvider>
        <PassAndPlayLocationGrid
          locations={[
            { id: "loc-1", name: "Airplane" },
            { id: "loc-2", name: "Beach" },
          ]}
          prevLocationName={null}
        />
      </I18nProvider>,
    );

    expect(screen.getByText("Airplane")).toBeInTheDocument();
    expect(screen.getByText("Beach")).toBeInTheDocument();
  });

  it("shows the retry state in the entity-owned role reveal carousel after a fetch failure", async () => {
    fetchPlayerRole.mockResolvedValue(null);
    const user = userEvent.setup();
    const { RoleRevealCarousel } = await import("./pass-and-play");

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
