import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function getMigrationDirectories() {
  return readdirSync(join(process.cwd(), "prisma", "migrations"), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

describe("Prisma migration baseline", () => {
  it("keeps the current schema in a single initial migration", () => {
    const directories = getMigrationDirectories();

    expect(directories).toEqual(["20260410000000_initial"]);
  });

  it("includes user and saved-location tables in the initial migration", () => {
    const migration = readFileSync(
      join(process.cwd(), "prisma", "migrations", "20260410000000_initial", "migration.sql"),
      "utf8",
    );

    expect(migration).toContain('CREATE TABLE "User"');
    expect(migration).toContain('CREATE TABLE "SavedLocation"');
    expect(migration).toContain(
      'ALTER TABLE "SavedLocation" ADD CONSTRAINT "SavedLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")',
    );
  });
});
