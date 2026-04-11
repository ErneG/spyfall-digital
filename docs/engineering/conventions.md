# Engineering Conventions

## Dependency graph

Runtime dependencies should flow in one direction:

- `src/app` can depend on `src/features`, `src/entities`, and `src/shared`.
- `src/features` can depend on `src/entities` and `src/shared`.
- `src/entities` can depend on `src/shared`.
- `src/shared` must never import upward into app, features, or entities.

This keeps the v2 shape explicit and avoids rebuilding a second cross-cutting middle layer.

## File naming

- Route convention files such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts` belong only inside `src/app`.
- Use kebab-case for source files and folders.
- Use suffixes for intent:
  - `*.schema.ts` for schemas and validation
  - `*.action.ts` or `actions.ts` for server mutations while legacy code is still being migrated
  - `*.query.ts` for query-layer fetch helpers
  - `*.client.tsx` for interactive client entry leaves
  - `*.server.ts` for server-only helpers
  - `*-parts.tsx`, `*-sections.tsx`, and `*-phases.tsx` for multi-component support files

## Server and client boundaries

- Keep routes and layouts server-first. Add `"use client"` only to interactive leaves.
- Client components must not import Prisma or other server-only modules.
- Hooks must not talk to the database directly.
- Environment variables are read through `src/shared/config/env.ts`, not ad hoc from `process.env`.

## Rule philosophy

- `error`: correctness, async safety, hooks rules, import resolution, architecture boundaries, and server/client isolation
- `warn`: smells, readability, and incremental cleanup opportunities

Warnings are meant to guide refactors, not bury actual breakage. If a warning stops being useful, tune the rule rather than training the team to ignore the output.
