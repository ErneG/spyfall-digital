import { describe, expect, it } from "vitest";

import { GameView as DomainGameView } from "@/domains/game/components/game-view";

import { GameView } from "./view";

describe("game entity view", () => {
  it("re-exports the online game view", () => {
    expect(GameView).toBe(DomainGameView);
  });
});
