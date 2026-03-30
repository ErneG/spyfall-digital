// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import promise from "eslint-plugin-promise";
import importX from "eslint-plugin-import-x";
// eslint-plugin-jsx-a11y loaded by eslint-config-next (no explicit import needed)
import reactPerf from "eslint-plugin-react-perf";
import queryPlugin from "@tanstack/eslint-plugin-query";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs["flat/recommended"],

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
    "public/sw.js",
    "public/workbox-*.js",
  ]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. TYPESCRIPT — STRICT TYPE SAFETY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // ── No any (the #1 type safety rule) ──
      "@typescript-eslint/no-explicit-any": "error",

      // ── No unsafe operations on `any` values ──
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",

      // ── Unused vars (allow underscore prefix) ──
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // ── No floating promises (must await or void) ──
      "@typescript-eslint/no-floating-promises": "error",

      // ── No misused promises (no promises in conditionals) ──
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],

      // ── Strict boolean expressions — no implicit coercion in conditions ──
      "@typescript-eslint/strict-boolean-expressions": [
        "warn",
        {
          allowString: true,
          allowNumber: false,
          allowNullableObject: true,
          allowNullableBoolean: true,
          allowNullableString: true,
        },
      ],

      // ── Exhaustive switch — forces handling all enum/union cases ──
      "@typescript-eslint/switch-exhaustiveness-check": "error",

      // ── No unnecessary conditions (dead branches from types) ──
      "@typescript-eslint/no-unnecessary-condition": "warn",

      // ── Consistent type imports ──
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // ── Consistent type exports ──
      "@typescript-eslint/consistent-type-exports": "error",

      // ── No non-null assertion (use proper narrowing) ──
      "@typescript-eslint/no-non-null-assertion": "error",

      // ── Require await in async functions ──
      "@typescript-eslint/require-await": "warn",

      // ── No unnecessary type assertions ──
      "@typescript-eslint/no-unnecessary-type-assertion": "error",

      // ── No redundant type constituents (e.g. string | never) ──
      "@typescript-eslint/no-redundant-type-constituents": "warn",

      // ── Prefer nullish coalescing (?? over ||) for safety ──
      "@typescript-eslint/prefer-nullish-coalescing": "warn",

      // ── No useless return-await (just return the promise) ──
      "@typescript-eslint/return-await": ["error", "in-try-catch"],

      // ── Naming conventions ──
      "@typescript-eslint/naming-convention": [
        "warn",
        // Booleans should read as yes/no questions
        {
          selector: "variable",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: ["is", "has", "should", "can", "did", "will"],
        },
        // Types/interfaces in PascalCase
        { selector: "typeLike", format: ["PascalCase"] },
        // Enum members in PascalCase or UPPER_CASE
        { selector: "enumMember", format: ["PascalCase", "UPPER_CASE"] },
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. SECURITY — PREVENT INJECTION & UNSAFE PATTERNS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      // ── No eval (XSS vector) ──
      "no-eval": "error",

      // ── No implied eval (setTimeout with string) ──
      "no-implied-eval": "error",
      "@typescript-eslint/no-implied-eval": "error",

      // ── No new Function() (eval in disguise) ──
      "no-new-func": "error",

      // ── No javascript: URLs ──
      "no-script-url": "error",

      // ── No void operator (confusing, use undefined) ──
      // Exception: void for fire-and-forget promises is OK
      "no-void": ["error", { allowAsStatement: true }],

      // ── No unsafe regex (ReDoS prevention) ──
      "no-control-regex": "error",
      "no-misleading-character-class": "error",

      // ── No prototype builtins (prototype pollution) ──
      "no-prototype-builtins": "error",

      // ── No debugger statements ──
      "no-debugger": "error",

      // ── No alert/confirm/prompt ──
      "no-alert": "error",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. PROMISE HYGIENE — CORRECT ASYNC PATTERNS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: { promise },
    rules: {
      // ── No async executor (anti-pattern, hides errors) ──
      "no-async-promise-executor": "error",

      // ── Reject with Error objects, not strings ──
      "prefer-promise-reject-errors": "error",

      // ── No returning values in Promise.finally ──
      "promise/no-return-in-finally": "error",

      // ── Must return inside .then() ──
      "promise/always-return": "warn",

      // ── No nesting promises (flatten with async/await) ──
      "promise/no-nesting": "warn",

      // ── No creating new promise when one already exists ──
      "promise/no-new-statics": "error",

      // ── Prefer await over .then() chains ──
      "promise/prefer-await-to-then": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. SONARJS — COGNITIVE COMPLEXITY & CODE SMELLS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: { sonarjs },
    rules: {
      // ── Cognitive complexity ──
      "sonarjs/cognitive-complexity": ["warn", 15],

      // ── No identical functions (DRY) ──
      "sonarjs/no-identical-functions": "warn",

      // ── No duplicated string literals ──
      "sonarjs/no-duplicate-string": ["warn", { threshold: 3 }],

      // ── No collapsible if statements ──
      "sonarjs/no-collapsible-if": "warn",

      // ── No redundant boolean ──
      "sonarjs/no-redundant-boolean": "error",

      // ── No inverted boolean check ──
      "sonarjs/no-inverted-boolean-check": "warn",

      // ── No identical conditions in if/else chains ──
      "sonarjs/no-all-duplicated-branches": "error",

      // ── No gratuitous expressions ──
      "sonarjs/no-gratuitous-expressions": "warn",

      // ── Prefer immediate return ──
      "sonarjs/prefer-immediate-return": "warn",

      // ── Prefer single boolean return ──
      "sonarjs/prefer-single-boolean-return": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. UNICORN — MODERN JS BEST PRACTICES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: { unicorn },
    rules: {
      "unicorn/no-instanceof-array": "error",
      "unicorn/prefer-at": "warn",
      "unicorn/prefer-string-starts-ends-with": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-number-properties": "error",
      "unicorn/prefer-structured-clone": "warn",
      "unicorn/prefer-spread": "warn",
      "unicorn/no-useless-promise-resolve-reject": "error",
      "unicorn/no-useless-undefined": "warn",
      "unicorn/prefer-ternary": ["warn", "only-single-line"],
      "unicorn/throw-new-error": "error",
      "unicorn/prefer-set-has": "warn",
      "unicorn/no-nested-ternary": "error",
      "unicorn/prefer-dom-node-text-content": "warn",
      "unicorn/prefer-dom-node-append": "warn",
      "unicorn/prevent-abbreviations": [
        "warn",
        {
          replacements: {
            props: false,
            ref: false,
            params: false,
            args: false,
            env: false,
            req: false,
            res: false,
            err: false,
            ctx: false,
            db: false,
            id: false,
            fn: false,
            e: { event: true, error: true },
            cb: { callback: true },
            btn: { button: true },
            msg: { message: true },
            num: { number: true },
            val: { value: true },
            arr: { array: true },
            str: { string: true },
            obj: { object: true },
            idx: { index: true },
            tmp: { temporary: true },
            ret: { result: true },
          },
          allowList: {
            searchParams: true,
            ProcessEnv: true,
            i: true,
            j: true,
            utils: true,
          },
        },
      ],
      "unicorn/prefer-regexp-test": "warn",
      "unicorn/error-message": "error",
      "unicorn/no-process-exit": "warn",
      "unicorn/prefer-switch": ["warn", { minimumCases: 4 }],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5b. REACT PERFORMANCE — PREVENT RE-RENDER ISSUES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.tsx"],
    plugins: { "react-perf": reactPerf },
    rules: {
      "react-perf/jsx-no-new-object-as-prop": "warn",
      "react-perf/jsx-no-new-array-as-prop": "warn",
      "react-perf/jsx-no-new-function-as-prop": "warn",
      "react-perf/jsx-no-jsx-as-prop": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5c. TANSTACK QUERY — DATA FETCHING PATTERNS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: { "@tanstack/query": queryPlugin },
    rules: {
      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/query/no-rest-destructuring": "warn",
      "@tanstack/query/stable-query-client": "error",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. IMPORT ORGANIZATION — ORDER & HYGIENE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: { "import-x": importX },
    settings: {
      "import-x/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      // ── Import order with groups ──
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["type"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // ── No duplicate imports from the same module ──
      "import-x/no-duplicates": "error",

      // ── No cycle dependencies (warn — can be slow on large codebases) ──
      "import-x/no-cycle": ["warn", { maxDepth: 4 }],

      // ── No self-imports ──
      "import-x/no-self-import": "error",

      // ── No useless path segments ──
      "import-x/no-useless-path-segments": "error",

      // ── Ensure imports resolve (off — TypeScript handles this) ──
      "import-x/no-unresolved": "off",

      // ── No mutable exports ──
      "import-x/no-mutable-exports": "error",

      // ── Prefer named exports ──
      "import-x/no-anonymous-default-export": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. ACCESSIBILITY — WCAG COMPLIANCE (jsx-a11y)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.tsx"],
    rules: {
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-autofocus": ["warn", { ignoreNonDOM: true }],
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/no-noninteractive-tabindex": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/no-redundant-roles": "warn",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/scope": "error",
      "jsx-a11y/media-has-caption": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. REACT — PERFORMANCE & CORRECTNESS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.tsx"],
    rules: {
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],
      "react/no-array-index-key": "warn",
      "react/self-closing-comp": "error",
      "react/no-unstable-nested-components": "error",
      "react/no-children-prop": "error",
      "react/no-danger": "warn",
      "react/no-deprecated": "error",
      "react/jsx-boolean-value": ["warn", "never"],
      "react/jsx-curly-brace-presence": [
        "warn",
        { props: "never", children: "never" },
      ],
      "react/jsx-no-useless-fragment": "warn",
      "react/no-string-refs": "error",
      "react/no-find-dom-node": "error",

      // ── React hooks rules — STRICT (error, not warn) ──
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      "react/no-direct-mutation-state": "error",
      "react/no-unknown-property": "error",
      "react/display-name": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. GENERAL CODE QUALITY — CLEAN CODE PRINCIPLES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // ── Curly braces required for all blocks ──
      curly: ["error", "all"],

      complexity: ["warn", 15],
      "max-lines-per-function": [
        "warn",
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
      "max-params": ["warn", 4],
      "max-depth": ["warn", 4],
      "max-lines": [
        "warn",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],

      "no-nested-ternary": "error",
      "no-duplicate-imports": "error",
      "prefer-template": "error",
      "no-else-return": "error",
      "arrow-body-style": ["warn", "as-needed"],
      "object-shorthand": "error",
      "prefer-destructuring": ["warn", { object: true, array: false }],
      eqeqeq: ["error", "always"],

      "no-magic-numbers": [
        "warn",
        {
          ignore: [
            -1, 0, 1, 2, 3, 5, 10, 12, 60, 100, 200, 300, 360, 400, 403, 404,
            420, 480, 500, 540, 600, 1000, 1500, 2000, 3000, 5000,
          ],
          ignoreArrayIndexes: true,
          enforceConst: true,
        },
      ],

      // ── Dead code detection ──
      "no-unreachable": "error",
      "no-unused-expressions": "error",
      "no-useless-return": "error",
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-useless-computed-key": "error",

      // ── No shadow variables ──
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "warn",

      "prefer-spread": "warn",
      "prefer-rest-params": "error",

      // ── No param reassignment (strict — error) ──
      "no-param-reassign": ["error", { props: false }],

      // ── Handled by @typescript-eslint/return-await ──
      "no-return-await": "off",

      "default-case": "warn",
      "default-case-last": "error",
      "one-var": ["error", "never"],
      "no-lonely-if": "error",
      "prefer-exponentiation-operator": "warn",
      "no-useless-escape": "error",
      "no-label-var": "error",
      "guard-for-in": "warn",
      "no-continue": "warn",
      "no-with": "error",
      "no-sequences": "error",
      "no-throw-literal": "error",
      "use-isnan": "error",
      "valid-typeof": "error",
      "no-empty-character-class": "error",
      "no-cond-assign": "error",
      "no-constant-condition": "warn",
      "no-empty-pattern": "error",
      "symbol-description": "error",
      yoda: "error",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. ARCHITECTURE BOUNDARY ENFORCEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── shared/ must NOT import from app/ or domains/ ──
  {
    files: ["src/shared/**/*.ts", "src/shared/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/app/**"],
              message:
                "shared/ must not import from app/ — dependency flows app/ -> domains/ -> shared/",
            },
            {
              group: ["@/domains/*", "@/domains/**"],
              message:
                "shared/ must not import from domains/ — dependency flows app/ -> domains/ -> shared/",
            },
          ],
        },
      ],
    },
  },

  // ── domains/ must NOT import from app/ ──
  {
    files: ["src/domains/**/*.ts", "src/domains/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/app/**"],
              message:
                "domains/ must not import from app/ — dependency flows app/ -> domains/ -> shared/",
            },
          ],
        },
      ],
    },
  },

  // ── Cross-domain boundary: room/ must not import from other domains ──
  {
    files: ["src/domains/room/**/*.ts", "src/domains/room/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/domains/game/*",
                "@/domains/game/**",
                "@/domains/location/*",
                "@/domains/location/**",
              ],
              message:
                "Domains must not import from other domains. Use shared types.",
            },
          ],
        },
      ],
    },
  },

  // ── Cross-domain boundary: game/ must not import from other domains ──
  {
    files: ["src/domains/game/**/*.ts", "src/domains/game/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/domains/room/*",
                "@/domains/room/**",
                "@/domains/location/*",
                "@/domains/location/**",
              ],
              message:
                "Domains must not import from other domains. Use shared types.",
            },
          ],
        },
      ],
    },
  },

  // ── Cross-domain boundary: location/ must not import from other domains ──
  {
    files: ["src/domains/location/**/*.ts", "src/domains/location/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/domains/room/*",
                "@/domains/room/**",
                "@/domains/game/*",
                "@/domains/game/**",
              ],
              message:
                "Domains must not import from other domains. Use shared types.",
            },
          ],
        },
      ],
    },
  },

  // ── Domain logic files — pure functions (no framework, no DB) ──
  {
    files: ["src/domains/**/logic.ts", "src/lib/game-logic.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next/*", "react", "react-dom"],
              message: "Logic must be framework-agnostic",
            },
            {
              group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"],
              message: "Logic must not depend on database",
            },
          ],
        },
      ],
      "max-lines-per-function": [
        "warn",
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
    },
  },

  // ── Domain schemas — Zod only, no framework deps ──
  {
    files: ["src/domains/**/schema.ts", "src/shared/types/**/*.ts"],
    rules: {
      "no-magic-numbers": "off",
      "@typescript-eslint/naming-convention": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "next/*"],
              message: "Schema files must be framework-agnostic",
            },
            {
              group: ["@/generated/*", "@prisma/*"],
              message: "Schemas must not depend on Prisma types directly",
            },
          ],
        },
      ],
    },
  },

  // ── Domain hooks — React hooks, max 60 lines ──
  {
    files: [
      "src/domains/**/hooks.ts",
      "src/hooks/**/*.ts",
      "src/shared/hooks/**/*.ts",
    ],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "max-lines-per-function": [
        "warn",
        { max: 60, skipBlankLines: true, skipComments: true },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"],
              message:
                "Hooks must not import database modules. Use server actions.",
            },
          ],
        },
      ],
    },
  },

  // ── Server Actions — relaxed for DB, no client imports, no default exports ──
  {
    files: ["src/domains/**/actions.ts"],
    rules: {
      "no-console": "off",
      "no-throw-literal": "error",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "no-magic-numbers": "off",
      complexity: "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/cognitive-complexity": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      // No default exports in action files
      "import-x/no-default-export": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/domains/*/components/*", "@/domains/*/hooks*"],
              message: "Server actions must not import client-side code",
            },
          ],
        },
      ],
    },
  },

  // ── Domain components — no direct DB access, no direct fetch ──
  {
    files: ["src/domains/**/components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"],
              message:
                "Components must not import database modules. Use server actions or hooks.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "Use TanStack Query or a query function from hooks.ts instead of direct fetch().",
        },
        {
          name: "setInterval",
          message:
            "Use useQuery with refetchInterval instead of setInterval for polling.",
        },
      ],
    },
  },

  // ── App pages — thin layer, no direct DB or fetch ──
  {
    files: ["src/app/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"],
              message:
                "Pages should not access DB directly. Use server actions or domain hooks.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "Use TanStack Query or a query function from hooks.ts instead of direct fetch().",
        },
        {
          name: "setInterval",
          message:
            "Use useQuery with refetchInterval instead of setInterval for polling.",
        },
      ],
    },
  },

  // ── API routes — relaxed for DB access ──
  {
    files: ["src/app/api/**/*.ts"],
    rules: {
      "no-console": "off",
      "no-throw-literal": "error",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "no-magic-numbers": "off",
      "max-lines-per-function": "off",
    },
  },

  // ── Legacy compatibility ──
  {
    files: ["src/components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/prisma", "@prisma/*", "@/generated/*"],
              message:
                "Components must not import server-only modules. Use server actions.",
            },
          ],
        },
      ],
    },
  },

  // ── shadcn/ui — generated code, heavily relaxed ──
  {
    files: ["src/components/ui/**/*.tsx", "src/shared/ui/**/*.tsx"],
    rules: {
      "react-perf/jsx-no-new-function-as-prop": "off",
      "react-perf/jsx-no-new-object-as-prop": "off",
      "react-perf/jsx-no-new-array-as-prop": "off",
      "react-perf/jsx-no-jsx-as-prop": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "unicorn/prevent-abbreviations": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "no-magic-numbers": "off",
      "react/display-name": "off",
      "import-x/no-default-export": "off",
    },
  },

  // ── Data/seed files — relaxed ──
  {
    files: ["src/data/**/*.ts", "src/domains/**/data.ts", "prisma/**/*.ts"],
    rules: {
      "no-magic-numbers": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "sonarjs/no-duplicate-string": "off",
    },
  },

  // ── Next.js pages/layouts — allow default exports (required by framework) ──
  {
    files: [
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/loading.tsx",
      "src/app/**/error.tsx",
      "src/app/**/not-found.tsx",
      "src/app/**/template.tsx",
      "src/app/**/default.tsx",
      "src/app/manifest.ts",
      "src/app/sitemap.ts",
      "src/app/robots.ts",
    ],
    rules: {
      "import-x/no-default-export": "off",
      "import-x/no-anonymous-default-export": "off",
    },
  },

  // ── Config files at root — relaxed ──
  {
    files: ["*.mjs", "*.js", "*.ts"],
    rules: {
      "import-x/no-default-export": "off",
      "import-x/no-anonymous-default-export": "off",
    },
  },

  // ── Storybook stories — relaxed ──
  {
    files: ["src/stories/**/*.ts", "src/stories/**/*.tsx"],
    rules: {
      "import-x/no-default-export": "off",
      "no-magic-numbers": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "react-perf/jsx-no-new-function-as-prop": "off",
      "react-perf/jsx-no-new-object-as-prop": "off",
      "react-perf/jsx-no-new-array-as-prop": "off",
    },
  },
]);

export default eslintConfig;
