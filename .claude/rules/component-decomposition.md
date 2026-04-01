## Component Size Limits (ESLint-enforced)

- Component files: **200 lines max** (error)
- Component functions: **60 lines max** (error)
- Max **20 statements** per component function
- Page files (app/): same limits — pages must be THIN

## When to Split a Component

Split immediately when ANY of these are true:

- File exceeds 150 lines (approaching the 200-line hard limit)
- Component has **more than 5 hooks** (useState, useCallback, useMemo, useRef, custom)
- Component manages **more than 3 pieces of state** (useState calls)
- Component has **more than 4 event handlers**
- Component renders **more than 2 conditional branches** (ternaries, &&, if/else in JSX)

## How to Split

### 1. Extract Custom Hooks (state + logic)

When a component has related state + handlers, extract a custom hook:

```tsx
// BAD — 8 hooks tangled in a component
function VotePanel() {
  const [voteIndex, setVoteIndex] = useState(-1);
  const [voteStep, setVoteStep] = useState<"select" | "confirm">("select");
  const [isVoting, setIsVoting] = useState(false);
  const handleVote = useCallback(...);
  const handleConfirm = useCallback(...);
  const handleCancel = useCallback(...);
  return <div>...</div>;
}

// GOOD — hook extracted, component is pure rendering
function useVoting(gameId: string) {
  const [voteIndex, setVoteIndex] = useState(-1);
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [isVoting, setIsVoting] = useState(false);
  // ... handlers
  return { voteIndex, step, isVoting, vote, confirm, cancel };
}

function VotePanel({ gameId }: { gameId: string }) {
  const voting = useVoting(gameId);
  return <div>...</div>;
}
```

### 2. Extract Subcomponents (rendering)

When JSX has distinct visual sections, extract them:

```tsx
// BAD — one component rendering header, body, and footer
function GameView() {
  return (
    <div>
      <div>{/* 30 lines of header */}</div>
      <div>{/* 40 lines of body */}</div>
      <div>{/* 20 lines of footer */}</div>
    </div>
  );
}

// GOOD — each section is its own component in a -parts.tsx file
function GameView() {
  return (
    <div>
      <GameHeader {...} />
      <GameBody {...} />
      <GameFooter {...} />
    </div>
  );
}
```

### 3. File Organization

- `component-name.tsx` — main component (orchestrator)
- `component-name-parts.tsx` — subcomponents (leaf rendering)
- `use-component-name.ts` — custom hook (state + logic)
- Place hooks in the domain's `hooks.ts` if reusable, or co-locate if single-use

## Props Limits

- Max **6 props** per component — if more, group related props into an object
- Never pass the entire domain object when a component only needs 2-3 fields
- Use `Pick<Type, "field1" | "field2">` to document exactly what's needed
