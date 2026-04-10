import { describe, expect, it } from "vitest";

import * as domainParts from "@/domains/game/components/game-view-parts";
import { PassAndPlayLocationGrid as DomainPassAndPlayLocationGrid } from "@/domains/game/components/pass-and-play-location-grid";
import { RolePeek as DomainRolePeek } from "@/domains/game/components/pass-and-play-role-peek";
import { RevealScreen as DomainRevealScreen } from "@/domains/game/components/reveal-screen";
import { RoleRevealCarousel as DomainRoleRevealCarousel } from "@/domains/game/components/role-reveal-carousel";

import {
  PassAndPlayLocationGrid,
  RevealScreen,
  RolePeek,
  RoleRevealCarousel,
  TimerSection,
  useExpiryBeep,
  useGameActions,
} from "./pass-and-play";

describe("game entity pass-and-play surface", () => {
  it("re-exports the pass-and-play runtime helpers", () => {
    expect(useExpiryBeep).toBe(domainParts.useExpiryBeep);
    expect(useGameActions).toBe(domainParts.useGameActions);
    expect(TimerSection).toBe(domainParts.TimerSection);
    expect(PassAndPlayLocationGrid).toBe(DomainPassAndPlayLocationGrid);
    expect(RolePeek).toBe(DomainRolePeek);
    expect(RevealScreen).toBe(DomainRevealScreen);
    expect(RoleRevealCarousel).toBe(DomainRoleRevealCarousel);
  });
});
