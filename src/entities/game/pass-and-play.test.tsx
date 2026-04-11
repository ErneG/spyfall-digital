import { describe, expect, it, vi } from "vitest";

const { gameViewParts } = vi.hoisted(() => ({
  gameViewParts: {
    TimerSection: Symbol("TimerSection"),
    useExpiryBeep: Symbol("useExpiryBeep"),
    useGameActions: Symbol("useGameActions"),
  },
}));

vi.mock("@/domains/game/components/game-view-parts", () => gameViewParts);

vi.mock("@/domains/game/components/pass-and-play-location-grid", () => {
  throw new Error("entities/game/pass-and-play should not import domain pass-and-play grid");
});

vi.mock("@/domains/game/components/pass-and-play-role-peek", () => {
  throw new Error("entities/game/pass-and-play should not import domain role peek");
});

vi.mock("@/domains/game/components/reveal-screen", () => {
  throw new Error("entities/game/pass-and-play should not import domain reveal screen");
});

vi.mock("@/domains/game/components/role-reveal-carousel", () => {
  throw new Error("entities/game/pass-and-play should not import domain role reveal carousel");
});

describe("game entity pass-and-play surface", () => {
  it("owns the pass-and-play runtime exports locally", async () => {
    const surface = await import("./pass-and-play");

    expect(surface.TimerSection).toBe(gameViewParts.TimerSection);
    expect(surface.useExpiryBeep).toBe(gameViewParts.useExpiryBeep);
    expect(surface.useGameActions).toBe(gameViewParts.useGameActions);
    expect(surface.PassAndPlayLocationGrid).toBeDefined();
    expect(surface.RolePeek).toBeDefined();
    expect(surface.RevealScreen).toBeDefined();
    expect(surface.RoleRevealCarousel).toBeDefined();
  });
});
