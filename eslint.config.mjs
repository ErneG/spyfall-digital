import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import queryPlugin from "@tanstack/eslint-plugin-query";
import boundaries from "eslint-plugin-boundaries";
import checkFile from "eslint-plugin-check-file";
import importX from "eslint-plugin-import-x";
import promise from "eslint-plugin-promise";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import sonarjs from "eslint-plugin-sonarjs";
import storybook from "eslint-plugin-storybook";

const typedFiles = [
  "src/**/*.ts",
  "src/**/*.tsx",
  "prisma/**/*.ts",
  "prisma.config.ts",
  "vitest.config.ts",
];

const appRouteFiles = [
  "src/app/**/page.tsx",
  "src/app/**/layout.tsx",
  "src/app/**/loading.tsx",
  "src/app/**/error.tsx",
  "src/app/**/not-found.tsx",
  "src/app/**/template.tsx",
  "src/app/**/default.tsx",
  "src/app/**/route.ts",
  "src/app/manifest.ts",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  reactHooks.configs.flat["recommended-latest"],
  ...storybook.configs["flat/recommended"],

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "storybook-static/**",
    "test-results/**",
    "src/stories/**/*.mdx",
    "next-env.d.ts",
    "src/generated/**",
    "public/sw.js",
    "public/workbox-*.js",
  ]),

  {
    files: typedFiles,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "@tanstack/query": queryPlugin,
      boundaries,
      "check-file": checkFile,
      "import-x": importX,
      promise,
      react: reactPlugin,
      sonarjs,
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "feature", pattern: "src/features/**" },
        { type: "entity", pattern: "src/entities/**" },
        { type: "domain", pattern: "src/domains/**" },
        { type: "shared", pattern: "src/shared/**" },
      ],
    },
    rules: {
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      "@typescript-eslint/strict-boolean-expressions": [
        "warn",
        {
          allowNullableBoolean: true,
          allowNullableObject: true,
          allowNullableString: true,
          allowString: true,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/naming-convention": [
        "warn",
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "enumMember", format: ["PascalCase", "UPPER_CASE"] },
      ],

      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/query/no-rest-destructuring": "warn",
      "@tanstack/query/stable-query-client": "error",

      "import-x/no-anonymous-default-export": "warn",
      "import-x/no-cycle": ["warn", { maxDepth: 4 }],
      "import-x/no-default-export": "error",
      "import-x/no-duplicates": "error",
      "import-x/no-mutable-exports": "error",
      "import-x/no-self-import": "error",
      "import-x/no-unresolved": "off",
      "import-x/no-useless-path-segments": "error",
      "import-x/order": [
        "error",
        {
          alphabetize: { caseInsensitive: true, order: "asc" },
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          pathGroups: [{ group: "internal", pattern: "@/**", position: "before" }],
          pathGroupsExcludedImportTypes: ["type"],
          "newlines-between": "always",
        },
      ],

      "promise/always-return": "warn",
      "promise/no-nesting": "warn",
      "promise/no-return-in-finally": "error",
      "prefer-promise-reject-errors": "error",
      "no-async-promise-executor": "error",

      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-duplicate-string": ["warn", { threshold: 4 }],
      "sonarjs/no-identical-functions": "warn",

      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: { type: "shared" },
              disallow: { to: { type: ["app", "feature", "entity", "domain"] } },
            },
            {
              from: { type: "entity" },
              allow: { to: { type: ["shared"] } },
            },
            {
              from: { type: "feature" },
              allow: { to: { type: ["entity", "shared"] } },
            },
            {
              from: { type: "domain" },
              allow: { to: { type: ["shared"] } },
            },
            {
              from: { type: "app" },
              allow: { to: { type: ["domain", "entity", "feature", "shared"] } },
            },
          ],
        },
      ],
      "check-file/filename-naming-convention": [
        "error",
        {
          "src/**/*.{ts,tsx}": "KEBAB_CASE",
        },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/app/**": "NEXT_JS_APP_ROUTER_CASE",
          "src/domains/**": "KEBAB_CASE",
          "src/entities/**": "KEBAB_CASE",
          "src/features/**": "KEBAB_CASE",
          "src/shared/**": "KEBAB_CASE",
        },
      ],

      "react/display-name": "warn",
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],
      "react/no-array-index-key": "warn",
      "react/no-children-prop": "error",
      "react/no-danger": "warn",
      "react/no-deprecated": "error",
      "react/no-find-dom-node": "error",
      "react/no-multi-comp": ["error", { ignoreStateless: false }],
      "react/no-string-refs": "error",
      "react/no-unknown-property": "error",
      "react/no-unstable-nested-components": "error",
      "react/self-closing-comp": "error",
      "react-hooks/exhaustive-deps": "error",

      complexity: ["error", 15],
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],
      "max-statements": ["error", 25],
      "no-alert": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-else-return": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-param-reassign": ["error", { props: false }],
      "no-script-url": "error",
      "no-var": "error",
      "no-void": ["error", { allowAsStatement: true }],
      "object-shorthand": "error",
      "prefer-const": "error",
      "prefer-template": "error",
    },
  },

  {
    files: ["src/shared/**/*.ts", "src/shared/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/app/*", "@/app/**"], message: "shared/ must not import from app/." },
            {
              group: [
                "@/domains/*",
                "@/domains/**",
                "@/features/*",
                "@/features/**",
                "@/entities/*",
                "@/entities/**",
              ],
              message: "shared/ must stay at the bottom of the dependency graph.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/domains/**/hooks.ts", "src/shared/hooks/**/*.ts", "src/shared/hooks/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"],
              message: "Hooks must not access the database directly.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/domains/**/components/**/*.tsx", "src/app/**/*.tsx"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "Use TanStack Query or a query helper instead of direct fetch().",
        },
        {
          name: "setInterval",
          message: "Prefer query polling to raw setInterval for app state refreshes.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"],
              message: "Client-facing UI must not import Prisma directly.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/domains/**/schema.ts", "src/shared/types/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "next/*"],
              message: "Schema files must stay framework-agnostic.",
            },
            {
              group: ["@/generated/*", "@prisma/*"],
              message: "Schema files must not depend on Prisma types.",
            },
          ],
        },
      ],
    },
  },

  {
    files: [
      "src/domains/**/actions.ts",
      "src/domains/**/*.action.ts",
      "src/features/**/*.action.ts",
    ],
    rules: {
      "no-console": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/domains/*/components/*",
                "@/domains/*/hooks*",
                "@/features/*/components/*",
              ],
              message: "Server actions must not import client-only modules.",
            },
          ],
        },
      ],
    },
  },

  {
    files: [
      "src/**/*-parts.tsx",
      "src/**/*-sections.tsx",
      "src/**/*-phases.tsx",
      "src/**/*-playing.tsx",
    ],
    rules: {
      "react/no-multi-comp": "off",
    },
  },

  {
    files: ["src/shared/ui/**/*.tsx", "src/components/ui/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "react/display-name": "off",
      "react/no-multi-comp": "off",
    },
  },

  {
    files: appRouteFiles,
    rules: {
      "import-x/no-anonymous-default-export": "off",
      "import-x/no-default-export": "off",
    },
  },

  {
    files: ["src/**/*.stories.{ts,tsx}", "src/**/*.stories.mdx"],
    rules: {
      "check-file/filename-naming-convention": "off",
      "check-file/folder-naming-convention": "off",
      "import-x/no-default-export": "off",
      "react/no-multi-comp": "off",
    },
  },

  {
    files: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.spec.ts", "src/**/*.spec.tsx"],
    rules: {
      "react/no-multi-comp": "off",
      "max-statements": "off",
      "sonarjs/no-duplicate-string": "off",
    },
  },

  {
    files: ["src/domains/**/data.ts", "prisma/**/*.ts"],
    rules: {
      "sonarjs/no-duplicate-string": "off",
    },
  },

  {
    files: ["*.mjs", "*.ts"],
    rules: {
      "check-file/filename-naming-convention": "off",
      "check-file/folder-naming-convention": "off",
      "import-x/no-anonymous-default-export": "off",
      "import-x/no-default-export": "off",
    },
  },

  eslintConfigPrettier,
]);
