---
description: Server Action patterns for Next.js mutations
globs: src/domains/**/actions.ts
---

## File Convention

- Every `actions.ts` file starts with `"use server";`
- Each action is a named export async function
- Actions validate input with Zod as the FIRST operation
- Actions return a typed result object, never throw to the client

## Return Pattern

All server actions return a discriminated union:
```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

## Error Handling

- Use try/catch inside the action, return `{ success: false, error: message }`
- NEVER let server errors leak to the client (no stack traces, no Prisma errors)
- Log server errors with `console.error` before returning

## Authorization

- Check `playerId` and `roomId` at the start of every action
- Host-only actions: verify `room.hostId === playerId` before proceeding
- Return `{ success: false, error: "Unauthorized" }` for auth failures

## Revalidation

- Call `revalidatePath()` after mutations that change page data
- Use `revalidateTag()` for shared cached data

## Usage in Components

- Call server actions directly: `const result = await createRoom(input)`
- Use `useTransition` for non-blocking mutations
- Use `useActionState` for form submissions with pending state
