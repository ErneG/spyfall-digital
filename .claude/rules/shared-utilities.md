## Use Shared Utilities — Never Reimplement

Before writing any pattern that looks like it could be reusable, check if a shared utility already exists. If you write the same pattern twice, extract it.

### Server Action Utilities (`@/shared/lib/action-utils.ts`)

**ALWAYS use these in server actions instead of raw try-catch + safeParse:**

```typescript
// ❌ BAD — raw safeParse + try-catch (duplicated 60+ times)
export async function myAction(input: MyInput): Promise<ActionResult<MyOutput>> {
  const parsed = myInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  try {
    const result = await doSomething(parsed.data);
    return ok(result);
  } catch (error) {
    console.error("myAction failed:", error);
    return fail("Failed to do something");
  }
}

// ✅ GOOD — use the shared wrapper
export const myAction = createAction(
  myInputSchema,
  async (data) => {
    return await doSomething(data);
  },
  "myAction",
);
```

**Available utilities:**

- `createAction(schema, handler, name)` — validates input, wraps in try-catch, returns ActionResult
- `parseInput(schema, input)` — validates and returns ActionResult with the parsed data
- `requireRoom(code)` — fetches room or returns fail("Room not found")
- `requireHost(code, playerId)` — fetches room + verifies host, or fails

### Shared Hooks (`@/shared/hooks/`)

**Use these instead of reimplementing timer/mutation patterns:**

- `useServerMutation(action, options)` — wraps server action in useMutation with unwrapAction + query invalidation
- `useTimeout(callback, delay)` — auto-cleanup timeout with ref
- `useInterval(callback, delay)` — auto-cleanup interval with ref

```typescript
// ❌ BAD — manual mutation setup (duplicated 8+ times)
const mutation = useMutation({
  mutationFn: (input) => serverAction(input).then(unwrapAction),
  onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  onError: (err) => setError(err.message),
});

// ✅ GOOD — use shared hook
const mutation = useServerMutation(serverAction, {
  invalidateKeys: [queryKey],
  onError: (err) => setError(err.message),
});
```

### Shared Constants (`@/shared/lib/constants.ts`)

**All game constants live here. Never duplicate:**

- `MIN_PLAYERS`, `MAX_PLAYERS`, `DEFAULT_TIME_LIMIT`, `MAX_ROLES_PER_LOCATION`
- `REVEAL_PHASES` — set of phases that show reveal UI
- Phase-related constants used in multiple components

### Before Writing New Code

1. **Grep for the pattern** you're about to write
2. If it exists elsewhere, check if there's a shared utility
3. If no shared utility exists and the pattern appears 2+ times, **create one**
4. If a shared utility exists, **use it**
