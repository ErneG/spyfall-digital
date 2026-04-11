# Spyfall Digital — Session Handoff

## What This Project Is

Digital Spyfall — a multiplayer social deduction PWA where one player is the spy who doesn't know the location, and other players try to identify the spy through questions. Inspired by [adrianocola/spyfall](https://github.com/adrianocola/spyfall).

**Location**: `/Users/ernestsdane/Documents/GitHub/spyfall-digital`

## Current State (as of 2026-03-22)

- **Build**: Clean — `pnpm build` passes, `pnpm lint` 0 errors/0 warnings, `pnpm exec tsc --noEmit` clean
- **21 commits** on `main` branch, working tree clean
- **Not deployed** — runs locally with Docker Compose (PostgreSQL) + `pnpm dev`
- **Database**: 54 locations seeded, schema pushed, Docker PostgreSQL on port 5433

## Architecture

Domain-driven design with strict boundaries enforced by ESLint:

```
app/ → domains/ → shared/    (dependency direction, never reverse)
```

- **`src/domains/room/`** — schema.ts (Zod), actions.ts (Server Actions), hooks.ts (SSE), components/
- **`src/domains/game/`** — schema.ts, actions.ts, hooks.ts, logic.ts (pure), components/
- **`src/domains/location/`** — schema.ts, actions.ts, data.ts (seeds), components/
- **`src/shared/`** — lib/ (prisma, utils, constants), ui/ (shadcn), hooks/ (useSession), types/ (ActionResult, GamePhase, PlayerInfo)
- **`src/app/`** — thin route layer, home-parts.tsx, loading/error boundaries
- **`src/app/api/`** — GET routes only (SSE + polling). All mutations are Server Actions.

**Key conventions**: Zod-first types (`z.infer<>`), `ActionResult<T>` return pattern, React.memo on all leaf components, useCallback/useMemo everywhere, no `any`.

## Tech Stack

Next.js 16 (App Router, React Compiler, Turbopack) | shadcn/ui + Tailwind v4 (base-ui, not radix) | PostgreSQL + Prisma 7 (adapter pattern) | Zod 4 | pnpm | Docker Compose | PWA

## What's Been Built

### Core Game

- Room create/join with 5-char codes
- Real-time player list via SSE (1.5s polling)
- Game start with random location + role assignment (Fisher-Yates shuffle)
- Role reveal (tap to show/hide), spy sees "?????" instead of location
- 54-location grid with click-to-cross-out + previous location strikethrough
- Voting system (accuse spy), spy can guess location
- Reveal screen with spy/location reveal + play again
- Game state polling every 5s with Zod validation

### Configuration (matching original spyfall)

- Timer presets: 6/7/8/9/10 minutes
- Spy count: 1 or 2
- Auto-start timer toggle
- Hide spy count toggle
- Moderator mode (host picks location, pre-assigns roles)
- Location selection (select/deselect by edition, filter, select all/none)
- Custom locations with custom roles + all-spies mode

### UX

- Dark/light mode toggle (next-themes)
- Timer pause/resume (host only)
- Audio beep on timer expiry (Web Audio API)
- Previous location tracking (avoids repeats)
- PWA manifest + service worker
- Loading skeletons + error boundaries

### Developer Experience

- 12 Claude Code hooks (guard-env, guard-main-branch, auto-format, lint-on-edit, typecheck-on-edit, commit-reminder, capture-errors, compound-learnings, apply-proposals, quality-sentinel, pre-push-check, guard-large-file-read)
- 8 Claude rules (clean-architecture, zod-types, server-actions, nextjs-optimizations, react-performance, hooks-patterns, game-logic-separation, prisma-conventions)
- Self-improving error loop: capture → analyze → propose → auto-apply
- ESLint: 10 plugin categories (typescript, security, promise, sonarjs, unicorn, react-perf, jsx-a11y, react, architecture boundaries)
- Prettier with Tailwind plugin

## What's NOT Done Yet

### Must-Have

- **Delete legacy API route POST handlers** — Server Actions replaced them but the old routes still exist in `src/app/api/`. They're dead code now. Keep only: `GET /api/rooms/[code]`, `GET /api/rooms/[code]/events`, `GET /api/rooms/[code]/locations`, `GET /api/games/[id]`
- **Browser testing** — the app hasn't been play-tested end-to-end in a browser yet. Need to verify all flows work with the Server Action migration
- **Moderator UI** — moderator mode toggle exists but the UI for the host to pick a specific location and assign roles to players before starting is not built
- **Custom location editor UI** — can create/delete custom locations but no inline editing of name/roles

### Nice-to-Have

- **Export/import location configs** — original spyfall lets players share location selections via shareable codes
- **Sound effects** — only timer beep exists; original has more audio feedback
- **i18n** — original supports 61 languages; we have English only
- **Animations** — minimal transitions; original uses animate.css
- **Player removal** — host can't kick players from lobby
- **Reconnection UX** — SSE reconnects but no user-facing notification when state is stale
- **Tests** — zero test coverage. Domain logic in `logic.ts` is pure and easily testable
- **Deployment** — not deployed anywhere yet (Coolify MCP available)

## How to Start Dev

```bash
docker compose up -d          # PostgreSQL on port 5433
pnpm db:push && pnpm db:seed  # Only first time
pnpm dev                      # http://localhost:3000
```

## Key Files to Read First

1. `CLAUDE.md` — full project docs, conventions, architecture
2. `src/domains/room/schema.ts` — Zod schemas for room domain (shows the type pattern)
3. `src/domains/game/actions.ts` — Server Action pattern (shows mutation pattern)
4. `src/domains/game/components/game-view.tsx` — main game UI (shows component pattern)
5. `.claude/rules/clean-architecture.md` — architectural rules
6. `eslint.config.mjs` — all lint rules and boundary enforcement
