import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import manifest from "./manifest";

const projectRoot = process.cwd();

describe("app manifest", () => {
  it("points at real installable icon assets", () => {
    const iconEntries = manifest().icons ?? [];

    expect(iconEntries.length).toBeGreaterThanOrEqual(2);

    for (const icon of iconEntries) {
      expect(icon.src.startsWith("/")).toBe(true);
      expect(existsSync(join(projectRoot, "public", icon.src.slice(1)))).toBe(true);
    }
  });
});
