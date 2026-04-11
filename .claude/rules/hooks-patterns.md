---
description: Custom hook conventions to prevent memory leaks and performance issues
globs: src/hooks/**/*.ts
---

## Interval / Timer Hooks

- Store interval/timeout IDs in `useRef`, not state
- Always `clearInterval`/`clearTimeout` in the effect cleanup
- If the callback depends on props, wrap it in `useCallback` first
- Never schedule multiple timers for the same purpose (guard with ref)

## SSE / EventSource Hooks

- Store EventSource in `useRef`
- Store reconnection timeout in a separate `useRef`
- Clear pending reconnection before scheduling a new one
- Close EventSource in cleanup function
- Set connected=false on error BEFORE scheduling reconnect

## Fetch / Polling Hooks

- Minimum polling interval: 5 seconds
- Store `setInterval` in `useRef` and clean up properly
- Separate initial fetch from interval setup if needed
- Use `useCallback` for the fetch function to stabilize dependencies

## Session / Storage Hooks

- Initialize state as `null`, never from localStorage directly
- Load from localStorage in `useEffect` (avoids hydration mismatch)
- Expose a `loaded` boolean so consumers can show loading/null state
- Wrap setters in `useCallback` so they're stable references
