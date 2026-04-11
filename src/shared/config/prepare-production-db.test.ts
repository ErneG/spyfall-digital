import { describe, expect, it } from "vitest";

import { getDatabasePreparationCommands } from "../../../scripts/prepare-production-db.mjs";

describe("getDatabasePreparationCommands", () => {
  it("uses checked migrations when they exist", () => {
    expect(
      getDatabasePreparationCommands({
        deployStrategy: "auto",
        hasCheckedMigrations: true,
      }),
    ).toEqual([
      ["pnpm", "db:generate"],
      ["pnpm", "exec", "prisma", "migrate", "deploy"],
      ["pnpm", "db:seed"],
    ]);
  });

  it("falls back to db push when no checked migrations exist", () => {
    expect(
      getDatabasePreparationCommands({
        deployStrategy: "auto",
        hasCheckedMigrations: false,
      }),
    ).toEqual([
      ["pnpm", "db:generate"],
      ["pnpm", "exec", "prisma", "db", "push"],
      ["pnpm", "db:seed"],
    ]);
  });

  it("honors an explicit migrate strategy", () => {
    expect(
      getDatabasePreparationCommands({
        deployStrategy: "migrate",
        hasCheckedMigrations: false,
      }),
    ).toEqual([
      ["pnpm", "db:generate"],
      ["pnpm", "exec", "prisma", "migrate", "deploy"],
      ["pnpm", "db:seed"],
    ]);
  });

  it("honors an explicit push strategy", () => {
    expect(
      getDatabasePreparationCommands({
        deployStrategy: "push",
        hasCheckedMigrations: true,
      }),
    ).toEqual([
      ["pnpm", "db:generate"],
      ["pnpm", "exec", "prisma", "db", "push"],
      ["pnpm", "db:seed"],
    ]);
  });
});
