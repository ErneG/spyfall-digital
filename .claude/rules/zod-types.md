---
description: Zod schema conventions — single source of truth for all types
globs: src/domains/**/schema.ts,src/shared/types/**
---

## Schema File Conventions

- Every domain has exactly ONE `schema.ts` file
- Schemas are the SINGLE SOURCE OF TRUTH for types
- Export both the schema AND the inferred type:
  ```ts
  export const roomConfigSchema = z.object({ ... });
  export type RoomConfig = z.infer<typeof roomConfigSchema>;
  ```

## Naming Conventions

- Input schemas (for mutations): `createRoomInput`, `castVoteInput`
- Output schemas (for responses): `roomStateOutput`, `gameViewOutput`
- Shared/entity schemas: `playerSchema`, `locationSchema`
- Type names: PascalCase matching schema → `CreateRoomInput`, `RoomStateOutput`

## Validation Rules

- ALWAYS use `.parse()` or `.safeParse()` at system boundaries
- Server Actions: validate input as first operation
- SSE/polling: validate parsed JSON before setting state
- NEVER use `as` type assertions on external data — use Zod instead
- NEVER use `any` — if type is unknown, validate with Zod

## Schema Composition

- Use `.pick()`, `.omit()`, `.extend()` to derive schemas from base schemas
- Use `.merge()` to combine schemas from different domains
- Shared schemas go in `src/shared/types/`

## Prisma ↔ Zod Boundary

- Prisma types are internal to Server Actions — never expose to client
- Map Prisma results to Zod output schemas before returning
- Use `satisfies z.infer<typeof schema>` for compile-time checks when mapping
