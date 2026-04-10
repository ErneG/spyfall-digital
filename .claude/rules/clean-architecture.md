---
description: Clean architecture and SOLID principles for domain-driven structure
globs: src/**
---

## Directory Structure — Dependency Direction

```
app/ → domains/ → shared/
```

- `app/` pages are THIN — import from domains, render components, nothing else
- `domains/` contain all business logic, organized by domain (room, game, player, location)
- `shared/` contains infrastructure (prisma, utils) and UI primitives (shadcn)
- **Never import from `app/` into `domains/` or `shared/`**
- **Never import from one domain into another domain** — use shared types instead

## Domain Structure

Each domain (`src/domains/{name}/`) contains:

- `schema.ts` — Zod schemas as single source of truth. All types inferred via `z.infer<>`
- `actions.ts` — Server Actions (`"use server"`) for all mutations
- `hooks.ts` — Client-side hooks for data fetching, SSE, state
- `logic.ts` — Pure functions (no DB, no React, no Next.js). Unit-testable.
- `components/` — React components specific to this domain

## SOLID Principles

### Single Responsibility

- Each file has ONE reason to change
- `schema.ts` changes when the data shape changes
- `actions.ts` changes when server mutations change
- `hooks.ts` changes when client-side data patterns change
- `logic.ts` changes when business rules change
- Components change when UI changes

### Open/Closed

- Server Actions accept Zod-validated input — extend by adding new schemas, not modifying existing ones
- Use composition over inheritance in components

### Liskov Substitution

- All hooks return consistent shapes — `{ data, isLoading, error }` pattern
- Components accept props interfaces, never concrete implementations

### Interface Segregation

- Don't pass entire `GameView` to a subcomponent — pass only the props it needs
- Don't export unused types from schema files

### Dependency Inversion

- Domain logic depends on abstractions (Zod schemas), not concrete implementations (Prisma types)
- Components depend on hook interfaces, not fetch implementations

## Zod-First Types

- **NEVER** hand-write a TypeScript interface for data that crosses a boundary
- Define Zod schema first → `export type X = z.infer<typeof xSchema>`
- Use `schema.parse(input)` at every boundary (server actions, API routes, SSE parsing)
- Prisma types stay in the DB layer — map to Zod types at the boundary

## Server Actions

- ALL mutations use Server Actions (`"use server"`)
- Server Actions validate input with Zod `.parse()` or `.safeParse()`
- Server Actions return typed results, never raw JSON
- Use `revalidatePath()` or `revalidateTag()` after mutations when needed
- Keep GET endpoints as API routes (for SSE, polling, caching)
