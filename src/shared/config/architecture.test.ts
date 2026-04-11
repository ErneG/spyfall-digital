import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const legacyDomainsPath = path.join(repoRoot, "src/domains");

describe("v2 architecture convergence", () => {
  it("removes the legacy src/domains layer once entities and features own runtime behavior", () => {
    expect(existsSync(legacyDomainsPath)).toBe(false);
  });
});
