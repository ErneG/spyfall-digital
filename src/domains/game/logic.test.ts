import { describe, it, expect } from "vitest";

import { shuffle, assignRoles } from "./logic";

// ─── shuffle ───────────────────────────────────────────────────

describe("shuffle", () => {
  it("returns a new array with the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it("handles an empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("handles a single-element array", () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

// ─── assignRoles ───────────────────────────────────────────────

describe("assignRoles", () => {
  const playerIds = ["p1", "p2", "p3", "p4", "p5"];
  const roles = ["Doctor", "Nurse", "Patient", "Janitor", "Secretary"];

  it("assigns exactly one spy by default", () => {
    const result = assignRoles(playerIds, roles);
    const spies = result.filter((r) => r.isSpy);
    expect(spies).toHaveLength(1);
  });

  it("assigns the correct number of spies", () => {
    const result = assignRoles(playerIds, roles, 2);
    const spies = result.filter((r) => r.isSpy);
    expect(spies).toHaveLength(2);
  });

  it("assigns roles to all players", () => {
    const result = assignRoles(playerIds, roles);
    expect(result).toHaveLength(playerIds.length);
    const assignedIds = result.map((r) => r.playerId);
    expect(new Set(assignedIds).size).toBe(playerIds.length);
  });

  it("gives spies the role 'SPY'", () => {
    const result = assignRoles(playerIds, roles, 1);
    const spies = result.filter((r) => r.isSpy);
    for (const spy of spies) {
      expect(spy.role).toBe("SPY");
    }
  });

  it("gives non-spies a role from the roles list", () => {
    const result = assignRoles(playerIds, roles, 1);
    const nonSpies = result.filter((r) => !r.isSpy);
    for (const player of nonSpies) {
      expect(roles).toContain(player.role);
    }
  });

  it("handles minimum players (3)", () => {
    const ids = ["p1", "p2", "p3"];
    const result = assignRoles(ids, roles, 1);
    expect(result).toHaveLength(3);
    expect(result.filter((r) => r.isSpy)).toHaveLength(1);
  });

  it("handles maximum spies equal to number of remaining players", () => {
    const ids = ["p1", "p2", "p3"];
    const result = assignRoles(ids, roles, 3);
    expect(result.filter((r) => r.isSpy)).toHaveLength(3);
    expect(result.filter((r) => !r.isSpy)).toHaveLength(0);
  });

  it("wraps roles when there are more non-spy players than roles", () => {
    const ids = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"];
    const fewRoles = ["Alpha", "Beta"];
    const result = assignRoles(ids, fewRoles, 1);
    const nonSpies = result.filter((r) => !r.isSpy);
    // All non-spy roles should come from the available roles
    for (const player of nonSpies) {
      expect(fewRoles).toContain(player.role);
    }
  });
});

// ─── assignRoles with moderator pre-assignments ──────────────────

describe("assignRoles with moderator pre-assignments", () => {
  const playerIds = ["p1", "p2", "p3", "p4", "p5"];
  const roles = ["Doctor", "Nurse", "Patient", "Janitor", "Secretary"];

  it("respects pre-assigned spy role", () => {
    const result = assignRoles(playerIds, roles, 1, [{ playerId: "p3", role: "SPY" }]);
    const p3 = result.find((r) => r.playerId === "p3");
    expect(p3?.isSpy).toBe(true);
    expect(p3?.role).toBe("SPY");
    expect(result.filter((r) => r.isSpy)).toHaveLength(1);
  });

  it("respects pre-assigned non-spy role", () => {
    const result = assignRoles(playerIds, roles, 1, [{ playerId: "p2", role: "Doctor" }]);
    const p2 = result.find((r) => r.playerId === "p2");
    expect(p2?.role).toBe("Doctor");
    expect(p2?.isSpy).toBe(false);
  });

  it("reduces remaining spy slots when spy is pre-assigned", () => {
    const result = assignRoles(playerIds, roles, 2, [{ playerId: "p1", role: "SPY" }]);
    const spies = result.filter((r) => r.isSpy);
    expect(spies).toHaveLength(2);
    expect(spies.some((s) => s.playerId === "p1")).toBe(true);
  });

  it("handles multiple moderator pre-assignments", () => {
    const result = assignRoles(playerIds, roles, 1, [
      { playerId: "p1", role: "SPY" },
      { playerId: "p5", role: "Doctor" },
    ]);
    expect(result.find((r) => r.playerId === "p1")?.isSpy).toBe(true);
    expect(result.find((r) => r.playerId === "p5")?.role).toBe("Doctor");
    expect(result).toHaveLength(playerIds.length);
  });
});
