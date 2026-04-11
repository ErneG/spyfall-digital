import { describe, expect, it } from "vitest";

import config from "../../.storybook/main";

interface StorybookAlias {
  find: string;
  replacement: string;
}

function isStorybookAlias(value: unknown): value is StorybookAlias {
  return (
    typeof value === "object" &&
    value !== null &&
    "find" in value &&
    "replacement" in value &&
    typeof value.find === "string" &&
    typeof value.replacement === "string"
  );
}

describe("storybook main config", () => {
  it("aliases server-only auth and prisma modules to Storybook mocks", async () => {
    expect(config.viteFinal).toBeTypeOf("function");

    const result = await config.viteFinal?.(
      {
        resolve: {
          alias: {
            "@base/alias": "/tmp/base-alias.ts",
          },
        },
      } as never,
      {} as never,
    );

    const aliases = Array.isArray(result?.resolve?.alias)
      ? result.resolve.alias.filter(isStorybookAlias)
      : [];

    expect(aliases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ find: "@/entities/game/actions" }),
        expect.objectContaining({ find: "@/entities/library/actions" }),
        expect.objectContaining({ find: "@/entities/location/actions" }),
        expect.objectContaining({ find: "@/entities/profile/actions" }),
        expect.objectContaining({ find: "@/entities/room/actions" }),
        expect.objectContaining({ find: "@/shared/lib/auth-session" }),
        expect.objectContaining({ find: "@/shared/lib/prisma" }),
      ]),
    );

    expect(
      aliases.find((alias) => alias.find === "@/entities/game/actions")?.replacement,
    ).toContain("src/storybook/stubs/game-actions.ts");
    expect(
      aliases.find((alias) => alias.find === "@/entities/library/actions")?.replacement,
    ).toContain("src/storybook/stubs/library-actions.ts");
    expect(
      aliases.find((alias) => alias.find === "@/entities/location/actions")?.replacement,
    ).toContain("src/storybook/stubs/location-actions.ts");
    expect(
      aliases.find((alias) => alias.find === "@/entities/profile/actions")?.replacement,
    ).toContain("src/storybook/stubs/profile-actions.ts");
    expect(
      aliases.find((alias) => alias.find === "@/entities/room/actions")?.replacement,
    ).toContain("src/storybook/stubs/room-actions.ts");
    expect(
      aliases.find((alias) => alias.find === "@/shared/lib/auth-session")?.replacement,
    ).toContain("src/storybook/stubs/auth-session.ts");
    expect(aliases.find((alias) => alias.find === "@/shared/lib/prisma")?.replacement).toContain(
      "src/storybook/stubs/prisma.ts",
    );
    expect(aliases.find((alias) => alias.find === "@base/alias")?.replacement).toBe(
      "/tmp/base-alias.ts",
    );
  });
});
