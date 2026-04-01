## Type Safety — Zero Trust at Boundaries

Every piece of data crossing a trust boundary MUST be validated with Zod. Trust nothing from outside the current function scope.

### Boundaries That Require Zod Validation

| Boundary                    | How                                        |
| --------------------------- | ------------------------------------------ |
| Server Action input         | `schema.safeParse(input)` as first line    |
| SSE/WebSocket messages      | `schema.safeParse(JSON.parse(event.data))` |
| localStorage/sessionStorage | `schema.safeParse(JSON.parse(raw))`        |
| URL params/search params    | `schema.safeParse(params)`                 |
| API response bodies         | `schema.safeParse(response)`               |
| JSON.parse() output         | Always validate — never cast with `as`     |

### Banned Patterns

```typescript
// ❌ NEVER — `as` type assertion on external data
const data = JSON.parse(raw) as MyType;

// ✅ ALWAYS — Zod validation
const parsed = mySchema.safeParse(JSON.parse(raw));
if (!parsed.success) { /* handle error */ }
const data = parsed.data;

// ❌ NEVER — Record<string, unknown> as function input
function update(input: Record<string, unknown>) { ... }

// ✅ ALWAYS — Zod-inferred type
function update(input: UpdateInput) { ... }

// ❌ NEVER — hand-written interface for data shapes
interface UserData { name: string; email: string; }

// ✅ ALWAYS — Zod schema → inferred type
const userDataSchema = z.object({ name: z.string(), email: z.email() });
type UserData = z.infer<typeof userDataSchema>;

// ❌ NEVER — inline type for action output
type Output = { id: string; name: string };

// ✅ ALWAYS — Zod output schema in schema.ts
export const outputSchema = z.object({ id: z.string(), name: z.string() });
export type Output = z.infer<typeof outputSchema>;
```

### Generic Type Rules

- **`useServerMutation<TInput, TOutput>`** — generics inferred from action signature, never specify manually
- **`ActionResult<T>`** — T must be a Zod-inferred type, never a hand-written interface
- **`createAction<TInput, TOutput>`** — generics inferred from schema + handler return type
- **`useState<T>`** — explicit generic only when initial value doesn't match full type (e.g. `useState<Session | null>(null)`)
- **`useRef<T>`** — always explicit when initial is null (e.g. `useRef<HTMLDivElement | null>(null)`)

### Where Types Live

- **Zod schemas** → `domains/*/schema.ts` or `shared/types/*.ts`
- **React component props** → inline in the component file (these are internal, not boundary types)
- **Hook options/return types** → inline or co-located (internal contracts)

### `as const` Is OK

`as const` is acceptable because it narrows types, not widens them:

```typescript
const phases = ["LOBBY", "PLAYING", "VOTING"] as const; // ✅ Fine
```
