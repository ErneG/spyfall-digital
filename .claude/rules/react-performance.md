---
description: React performance patterns to prevent re-render issues
globs: src/components/**/*.tsx,src/app/**/*.tsx
---

## Component Memoization

- ALL leaf components that receive props must be wrapped in `React.memo`
- Extract subcomponents rendered inside `.map()` into separate memoized components
- Never define components inside other components (causes remount on every render)

## Callback Stability

- Every function passed as a prop MUST use `useCallback`
- Every event handler in JSX (`onClick`, `onChange`, `onCheckedChange`) must be a stable reference
- Never write `onClick={() => doThing(x)}` inline — extract to a `useCallback` handler
- For handler factories (e.g., preset buttons), create a single `useCallback` that accepts the parameter

## Computed Values

- Arrays/objects derived from state (filter, map, sort) MUST use `useMemo`
- Display formatting (time display, counts, filtered lists) MUST use `useMemo`
- If a computation runs inside a `.map()` loop with 10+ items, extract it

## Polling & Intervals

- Polling intervals: minimum 5 seconds for game state, 1.5s for SSE is acceptable
- Store `setInterval` return value in `useRef` and clear in cleanup
- Never put the fetch function in `useEffect` dependency array without `useCallback`
- SSE reconnection must use ref-based timeout to prevent pile-up

## Hydration Safety

- Never read `localStorage`/`sessionStorage` during state initialization
- Always defer browser-only reads to `useEffect` with a `loaded` flag
- Use `suppressHydrationWarning` on elements that differ server/client (theme)

## Audio & Resources

- Reuse `AudioContext` via `useRef` — never create a new one per event
- Clean up all timers, intervals, and event listeners in effect cleanup functions
