## No New API Routes — Server Actions Only

**NEVER create new files in `src/app/api/`.** All new endpoints MUST be server actions in `domains/*/actions.ts`.

### Why API Routes Are Wrong for This Project

- Server Actions are simpler: no manual request parsing, no response serialization
- Server Actions get automatic TypeScript type safety end-to-end
- Server Actions work with React transitions (`useTransition`, `useOptimistic`)
- API routes add unnecessary routing complexity

### The Only Exception: SSE

The ONLY valid API route is `src/app/api/rooms/[code]/events/route.ts` — it uses Server-Sent Events which require a persistent streaming connection that server actions cannot provide.

**If you need real-time data**: Use the existing SSE route or polling via `useQuery` with `refetchInterval`.

**If you need a mutation**: Server Action in `domains/*/actions.ts`.

**If you need to fetch data**: Server Action returning `ActionResult<T>`, consumed via `useQuery`.

### Checklist Before Creating an API Route

If you think you need an API route, answer these:

1. Does it require streaming/SSE? → If NO, use a server action
2. Does it need to be called from outside the app (webhooks)? → If NO, use a server action
3. Does it need specific HTTP headers/status codes? → If NO, use a server action

If all answers are NO, it MUST be a server action.
