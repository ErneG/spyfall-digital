## No God Files — Single Responsibility at the File Level

Every file must have ONE clear responsibility. If you can't describe what a file does in one sentence, it's doing too much.

## Hard Limits (ESLint-enforced)

| File Type  | Max Lines | Max Lines/Function | Max Statements |
| ---------- | --------- | ------------------ | -------------- |
| Components | 200       | 60                 | 20             |
| App pages  | 200       | 60                 | 20             |
| Hooks      | —         | 60                 | —              |
| Logic      | —         | 50                 | —              |
| Actions    | 300       | 80                 | 30             |
| API routes | 250       | 80                 | 25             |
| General    | 250       | 80                 | 25             |

## Warning Signs — Split Before You Hit the Limit

### Components

- **5+ hooks** → Extract a custom hook
- **3+ useState** → Extract state into a custom hook
- **4+ useCallback** → The callbacks belong in a hook, not the component
- **2+ conditional render branches** → Extract branch components
- **Rendering a `.map()` with 10+ lines per item** → Extract the item component

### Server Actions (actions.ts)

- **5+ exported actions in one file** → Split into per-action or per-feature files
- **Action function > 60 lines** → Extract helper functions into a utils file
- **Shared logic between actions** → Extract to domain's `logic.ts`

### Hooks (hooks.ts)

- **Hook > 40 lines** → It's doing too much — split data fetching from state management
- **3+ hooks in one file** → Consider one hook per file if they're independent

## Decomposition Patterns

### Pattern: Orchestrator + Parts

The main component is an orchestrator that composes subcomponents.

```
game-view.tsx        → orchestrator (wires hooks to parts)
game-view-parts.tsx  → pure rendering subcomponents
use-game-view.ts     → state management hook
```

### Pattern: Feature Slice

When an actions file grows, split by feature:

```
# BAD
actions.ts (500 lines — start, vote, end, restart, timer all in one file)

# GOOD
actions/start-game.ts
actions/voting.ts
actions/end-game.ts
actions/timer.ts
actions/index.ts (re-exports)
```

### Pattern: Hook per Concern

When a component manages multiple independent concerns:

```
# BAD — one hook managing voting, timer, and spy guess
useGamePlay() → 200 lines

# GOOD — one hook per concern
useVoting()   → 40 lines
useTimer()    → 30 lines
useSpyGuess() → 35 lines
```

## Before Adding Code to Any File

1. Check the file's current line count
2. If it's over 150 lines (component) or 200 lines (action), **decompose first**
3. Never add more code to an already-oversized file — that makes the problem worse
