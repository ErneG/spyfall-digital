import { describe, expect, it } from "vitest";

import * as domainHooks from "@/domains/game/hooks";

import { useGameState, useTimer } from "./hooks";

describe("game entity hooks", () => {
  it("re-exports the shared game hooks", () => {
    expect(useGameState).toBe(domainHooks.useGameState);
    expect(useTimer).toBe(domainHooks.useTimer);
  });
});
