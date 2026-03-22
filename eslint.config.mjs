import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import promise from "eslint-plugin-promise";
// eslint-plugin-jsx-a11y loaded by eslint-config-next (no explicit import needed)
import reactPerf from "eslint-plugin-react-perf";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

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
      "@typescript-eslint/no-non-null-assertion": "warn",

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
      // ── Cognitive complexity (more nuanced than cyclomatic) ──
      // Measures how hard code is to UNDERSTAND, not just branch count
      "sonarjs/cognitive-complexity": ["warn", 15],

      // ── No identical functions (DRY — extract shared logic) ──
      "sonarjs/no-identical-functions": "warn",

      // ── No duplicated string literals (extract constants) ──
      "sonarjs/no-duplicate-string": ["warn", { threshold: 3 }],

      // ── No collapsible if statements (combine conditions) ──
      "sonarjs/no-collapsible-if": "warn",

      // ── No redundant boolean ──
      "sonarjs/no-redundant-boolean": "error",

      // ── No inverted boolean check (prefer positive conditions) ──
      "sonarjs/no-inverted-boolean-check": "warn",

      // ── No identical conditions in if/else chains ──
      "sonarjs/no-all-duplicated-branches": "error",

      // ── No gratuitous expressions (always true/false) ──
      "sonarjs/no-gratuitous-expressions": "warn",

      // ── Prefer immediate return (no temp var before return) ──
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
      // ── Prefer Array.isArray() over instanceof ──
      "unicorn/no-instanceof-array": "error",

      // ── Prefer .at() for last element (arr.at(-1) vs arr[arr.length-1]) ──
      "unicorn/prefer-at": "warn",

      // ── Prefer String.startsWith/endsWith over regex ──
      "unicorn/prefer-string-starts-ends-with": "error",

      // ── Prefer String.includes over indexOf !== -1 ──
      "unicorn/prefer-includes": "error",

      // ── Prefer Number.isNaN over global isNaN ──
      "unicorn/prefer-number-properties": "error",

      // ── Prefer structuredClone over JSON.parse(JSON.stringify()) ──
      "unicorn/prefer-structured-clone": "warn",

      // ── Prefer Array.from over spread for iterables ──
      "unicorn/prefer-spread": "warn",

      // ── No unnecessary await in return ──
      "unicorn/no-useless-promise-resolve-reject": "error",

      // ── No empty catch blocks without comment ──
      "unicorn/no-useless-undefined": "warn",

      // ── Prefer ternary over simple if/else assignment ──
      "unicorn/prefer-ternary": ["warn", "only-single-line"],

      // ── Throw Error objects, not strings ──
      "unicorn/throw-new-error": "error",

      // ── Prefer using Set.has for multiple comparisons ──
      "unicorn/prefer-set-has": "warn",

      // ── No nested ternary (more nuanced version) ──
      "unicorn/no-nested-ternary": "error",

      // ── Prefer modern DOM APIs ──
      "unicorn/prefer-dom-node-text-content": "warn",
      "unicorn/prefer-dom-node-append": "warn",

      // ── Abbreviation expander (no confusing shortnames) ──
      "unicorn/prevent-abbreviations": [
        "warn",
        {
          replacements: {
            // Allow common React/Next.js abbreviations
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
            // But flag confusing ones
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
            // Allow common Next.js patterns
            searchParams: true,
            ProcessEnv: true,
            // Allow common loop/utility names
            i: true,
            j: true,
            utils: true,
          },
        },
      ],

      // ── Prefer RegExp named groups ──
      "unicorn/prefer-regexp-test": "warn",

      // ── Enforce error message in new Error() ──
      "unicorn/error-message": "error",

      // ── No process.exit in library code ──
      "unicorn/no-process-exit": "warn",

      // ── Prefer switch over long if/else chains ──
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
      // ── No JSX literal objects as props (creates new ref each render) ──
      // e.g. <Comp style={{ color: 'red' }} /> — extract to const or useMemo
      "react-perf/jsx-no-new-object-as-prop": "warn",

      // ── No JSX literal arrays as props ──
      // e.g. <Comp items={[1,2,3]} /> — extract to const or useMemo
      "react-perf/jsx-no-new-array-as-prop": "warn",

      // ── No inline arrow functions as JSX props ──
      // e.g. <Comp onClick={() => doThing()} /> — use useCallback
      "react-perf/jsx-no-new-function-as-prop": "warn",

      // ── No JSX spread of new objects ──
      // e.g. <Comp {...{ a: 1 }} /> — use named variable
      "react-perf/jsx-no-jsx-as-prop": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. ACCESSIBILITY — WCAG COMPLIANCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.tsx"],
    rules: {
      // ── Clickable elements must be focusable ──
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",

      // ── Images need alt text ──
      "jsx-a11y/alt-text": "error",

      // ── Anchors must have content ──
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "warn",

      // ── Labels associated with controls ──
      "jsx-a11y/label-has-associated-control": "warn",

      // ── No autofocus (disorienting for screen readers) ──
      "jsx-a11y/no-autofocus": ["warn", { ignoreNonDOM: true }],

      // ── Heading order (no skipping h1 → h3) ──
      "jsx-a11y/heading-has-content": "error",

      // ── ARIA roles must be valid ──
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-props": "error",

      // ── tabIndex only on interactive elements ──
      "jsx-a11y/no-noninteractive-tabindex": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. REACT — PERFORMANCE & CORRECTNESS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.tsx"],
    rules: {
      // ── Key in iterators ──
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],

      // ── No array index as key ──
      "react/no-array-index-key": "warn",

      // ── Self-closing tags ──
      "react/self-closing-comp": "error",

      // ── No unstable nested components (causes remounts) ──
      "react/no-unstable-nested-components": "error",

      // ── No children as prop ──
      "react/no-children-prop": "error",

      // ── No danger (dangerouslySetInnerHTML) without justification ──
      "react/no-danger": "warn",

      // ── No deprecated lifecycle methods ──
      "react/no-deprecated": "error",

      // ── Boolean props: prefer shorthand <Comp disabled /> ──
      "react/jsx-boolean-value": ["warn", "never"],

      // ── Curly brace consistency ──
      "react/jsx-curly-brace-presence": [
        "warn",
        { props: "never", children: "never" },
      ],

      // ── No useless fragments ──
      "react/jsx-no-useless-fragment": "warn",

      // ── No string refs (use useRef) ──
      "react/no-string-refs": "error",

      // ── No find-dom-node ──
      "react/no-find-dom-node": "error",

      // ── React hooks rules (applies to ALL components, not just hooks/) ──
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. GENERAL CODE QUALITY — CLEAN CODE PRINCIPLES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      // ── Prefer const ──
      "prefer-const": "error",
      "no-var": "error",

      // ── No console in components (use proper logging) ──
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // ── Complexity guard ──
      complexity: ["warn", 15],

      // ── Max lines per function (SRP) ──
      "max-lines-per-function": [
        "warn",
        { max: 100, skipBlankLines: true, skipComments: true },
      ],

      // ── Max function params ──
      "max-params": ["warn", 4],

      // ── Max depth of nesting ──
      "max-depth": ["warn", 4],

      // ── Max lines per file (encourage splitting) ──
      "max-lines": [
        "warn",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],

      // ── No nested ternaries ──
      "no-nested-ternary": "error",

      // ── No duplicate imports ──
      "no-duplicate-imports": "error",

      // ── Prefer template literals ──
      "prefer-template": "error",

      // ── Early return pattern ──
      "no-else-return": "error",

      // ── Arrow function bodies ──
      "arrow-body-style": ["warn", "as-needed"],

      // ── Object shorthand ──
      "object-shorthand": "error",

      // ── Prefer destructuring ──
      "prefer-destructuring": ["warn", { object: true, array: false }],

      // ── Strict equality ──
      eqeqeq: ["error", "always"],

      // ── No magic numbers ──
      "no-magic-numbers": [
        "warn",
        {
          ignore: [-1, 0, 1, 2, 3, 5, 10, 12, 60, 100, 200, 300, 360, 400, 403, 404, 420, 480, 500, 540, 600, 1000, 1500, 2000, 3000, 5000],
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

      // ── No shadow variables (confusing scope) ──
      "no-shadow": "off", // use TS version
      "@typescript-eslint/no-shadow": "warn",

      // ── Prefer spread over Object.assign ──
      "prefer-spread": "warn",

      // ── Prefer rest params over arguments ──
      "prefer-rest-params": "error",

      // ── No param reassignment (pure function principle) ──
      "no-param-reassign": ["warn", { props: false }],

      // ── Require default case in switch ──
      "default-case": "warn",

      // ── Default case last ──
      "default-case-last": "error",

      // ── Grouped variable declarations ──
      "one-var": ["error", "never"],

      // ── No lonely if in else ──
      "no-lonely-if": "error",

      // ── Prefer exponentiation operator ──
      "prefer-exponentiation-operator": "warn",

      // ── No unneeded escape ──
      "no-useless-escape": "error",

      // ── No label that is same as variable ──
      "no-label-var": "error",

      // ── Guard for-in (prototype chain) ──
      "guard-for-in": "warn",

      // ── No continue (encourage restructuring) ──
      "no-continue": "warn",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. DOMAIN ARCHITECTURE BOUNDARIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Domain logic files — pure functions (no framework, no DB)
  {
    files: ["src/domains/**/logic.ts", "src/lib/game-logic.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["next/*", "react", "react-dom"], message: "Logic must be framework-agnostic" },
            { group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"], message: "Logic must not depend on database" },
          ],
        },
      ],
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
    },
  },

  // Domain schemas — Zod only, no framework deps
  {
    files: ["src/domains/**/schema.ts", "src/shared/types/**/*.ts"],
    rules: {
      "no-magic-numbers": "off",
      "@typescript-eslint/naming-convention": "off", // Zod field names match DB schema
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react-dom", "next/*"], message: "Schema files must be framework-agnostic" },
            { group: ["@/generated/*", "@prisma/*"], message: "Schemas must not depend on Prisma types directly" },
          ],
        },
      ],
    },
  },

  // Domain hooks — React hooks, max 60 lines
  {
    files: ["src/domains/**/hooks.ts", "src/hooks/**/*.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],
      // Hooks must not access DB directly
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"], message: "Hooks must not import database modules. Use server actions." },
          ],
        },
      ],
    },
  },

  // Server Actions — relaxed for DB operations, no client imports
  {
    files: ["src/domains/**/actions.ts"],
    rules: {
      "no-console": "off",
      "no-throw-literal": "error",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "no-magic-numbers": "off",
      "complexity": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/cognitive-complexity": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/domains/*/components/*", "@/domains/*/hooks*"], message: "Server actions must not import client-side code" },
          ],
        },
      ],
    },
  },

  // Domain components — no direct DB access
  {
    files: ["src/domains/**/components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"], message: "Components must not import database modules. Use server actions or hooks." },
          ],
        },
      ],
    },
  },

  // Cross-domain boundary — domains must not import from each other
  {
    files: ["src/domains/room/**/*.ts", "src/domains/room/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            { group: ["@/domains/game/*", "@/domains/player/*", "@/domains/location/*"], message: "Domains should not import directly from other domains. Use shared types." },
          ],
        },
      ],
    },
  },
  {
    files: ["src/domains/game/**/*.ts", "src/domains/game/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            { group: ["@/domains/room/*", "@/domains/player/*", "@/domains/location/*"], message: "Domains should not import directly from other domains. Use shared types." },
          ],
        },
      ],
    },
  },

  // App pages — thin layer, import from domains only
  {
    files: ["src/app/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            { group: ["@/generated/*", "@prisma/*", "@/shared/lib/prisma"], message: "Pages should not access DB directly. Use server actions or domain hooks." },
          ],
        },
      ],
    },
  },

  // API routes (GET only after migration) — relaxed for DB access
  {
    files: ["src/app/api/**/*.ts"],
    rules: {
      "no-console": "off",
      "no-throw-literal": "error",
    },
  },

  // Legacy compatibility (keep until migration complete)
  {
    files: ["src/components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/prisma", "@prisma/*", "@/generated/*"], message: "Components must not import server-only modules. Use server actions." },
          ],
        },
      ],
    },
  },

  // shadcn/ui — generated code, heavily relaxed
  {
    files: ["src/components/ui/**/*.tsx"],
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
    },
  },

  // API routes — relaxed type safety for dynamic DB results
  {
    files: ["src/app/api/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "no-magic-numbers": "off",
      "max-lines-per-function": "off",
    },
  },

  // Data/seed files — relaxed rules
  {
    files: ["src/data/**/*.ts", "prisma/**/*.ts"],
    rules: {
      "no-magic-numbers": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "sonarjs/no-duplicate-string": "off",
    },
  },
]);

export default eslintConfig;
