---
description: Keep game logic framework-agnostic and testable
globs: src/lib/game-logic.ts
---

- Game logic in `src/lib/game-logic.ts` must be pure functions — no database, no React, no Next.js imports
- This file should be testable in isolation (import and call functions directly)
- All randomness should go through the shuffle/assignment functions defined here
- Game constants (MIN_PLAYERS, MAX_PLAYERS, DEFAULT_TIME_LIMIT) live here
- API routes orchestrate game logic + database; game-logic.ts contains the rules
