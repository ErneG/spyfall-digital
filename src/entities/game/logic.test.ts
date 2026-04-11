import { describe, expect, it } from "vitest";

import { assignRoles, shuffle } from "./logic";

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

  it("handles empty and single-item arrays", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([42])).toEqual([42]);
  });
});

describe("assignRoles", () => {
  const playerIds = ["p1", "p2", "p3", "p4", "p5"];
  const roles = ["Doctor", "Nurse", "Patient", "Janitor", "Secretary"];

  it("assigns exactly one spy by default", () => {
    const result = assignRoles(playerIds, roles);
    expect(result.filter((assignment) => assignment.isSpy)).toHaveLength(1);
  });

  it("assigns the requested number of spies and all players", () => {
    const result = assignRoles(playerIds, roles, 2);
    expect(result.filter((assignment) => assignment.isSpy)).toHaveLength(2);
    expect(result).toHaveLength(playerIds.length);
    expect(new Set(result.map((assignment) => assignment.playerId)).size).toBe(playerIds.length);
  });

  it("keeps non-spy roles inside the available role list", () => {
    const result = assignRoles(playerIds, roles, 1);
    for (const assignment of result.filter((entry) => !entry.isSpy)) {
      expect(roles).toContain(assignment.role);
    }
  });

  it("respects moderator pre-assignments", () => {
    const result = assignRoles(playerIds, roles, 2, [
      { playerId: "p1", role: "SPY" },
      { playerId: "p5", role: "Doctor" },
    ]);

    expect(result.find((assignment) => assignment.playerId === "p1")).toMatchObject({
      role: "SPY",
      isSpy: true,
    });
    expect(result.find((assignment) => assignment.playerId === "p5")).toMatchObject({
      role: "Doctor",
      isSpy: false,
    });
    expect(result.filter((assignment) => assignment.isSpy)).toHaveLength(2);
  });
});
