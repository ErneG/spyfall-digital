import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs-vite";

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

type StorybookAliasEntry = {
  find: string;
  replacement: string;
};

function normalizeAliases(alias: unknown): StorybookAliasEntry[] {
  if (Array.isArray(alias)) {
    return alias.filter(
      (entry: unknown): entry is StorybookAliasEntry =>
        typeof entry === "object" &&
        entry !== null &&
        "find" in entry &&
        "replacement" in entry &&
        typeof entry.find === "string" &&
        typeof entry.replacement === "string",
    );
  }

  if (alias && typeof alias === "object") {
    return Object.entries(alias).map(([find, replacement]) => ({
      find,
      replacement: String(replacement),
    }));
  }

  return [];
}

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  async viteFinal(config) {
    const aliases = normalizeAliases(config.resolve?.alias);

    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: [
          ...aliases,
          {
            find: "@/entities/game/actions",
            replacement: path.resolve(storybookDir, "../src/storybook/stubs/game-actions.ts"),
          },
          {
            find: "@/entities/library/actions",
            replacement: path.resolve(storybookDir, "../src/storybook/stubs/library-actions.ts"),
          },
          {
            find: "@/entities/location/actions",
            replacement: path.resolve(storybookDir, "../src/storybook/stubs/location-actions.ts"),
          },
          {
            find: "@/entities/profile/actions",
            replacement: path.resolve(storybookDir, "../src/storybook/stubs/profile-actions.ts"),
          },
          {
            find: "@/entities/room/actions",
            replacement: path.resolve(storybookDir, "../src/storybook/stubs/room-actions.ts"),
          },
          {
            find: "@/shared/lib/auth-session",
            replacement: path.resolve(storybookDir, "../src/storybook/stubs/auth-session.ts"),
          },
          {
            find: "@/shared/lib/prisma",
            replacement: path.resolve(storybookDir, "../src/storybook/stubs/prisma.ts"),
          },
        ],
      },
    };
  },
};

export default config;
