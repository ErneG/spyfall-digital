@AGENTS.md

# Spyfall Digital

A digital adaptation of the social deduction game Spyfall, built as a PWA with Next.js.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Compiler, Server Actions)
- **UI**: shadcn/ui + Tailwind CSS v4 (dark mode by default)
- **Database**: PostgreSQL + Prisma 7 (adapter pattern with `@prisma/adapter-pg`)
- **Validation**: Zod 4 (single source of truth for all types)
- **PWA**: @ducanh2912/next-pwa
- **Real-time**: SSE for room state, polling for game state
- **Infra**: Docker Compose (PostgreSQL on port 5433)
- **Design**: Stitch MCP + Nano Banana MCP

## Architecture — Domain-Driven Design

```
src/
├── app/                     # Routes only (THIN — import from domains)
│   ├── page.tsx             # Home page
│   ├── home-parts.tsx       # Home subcomponents + useHomeState hook
│   ├── loading.tsx          # Global loading skeleton
│   ├── error.tsx            # Global error boundary
│   ├── room/[code]/         # Room page + loading/error boundaries
│   └── api/                 # GET routes only (SSE + polling)
│       ├── rooms/[code]/events/  # SSE stream
│       └── games/[id]/          # Game state polling
├── domains/                 # Business logic organized by domain
│   ├── room/
│   │   ├── schema.ts        # Zod schemas → inferred types
│   │   ├── actions.ts       # Server Actions (createRoom, joinRoom, updateConfig)
│   │   ├── hooks.ts         # useRoomEvents (SSE with Zod validation)
│   │   └── components/      # GameConfig, RoomCodeHeader, PlayerList, StartSection
│   ├── game/
│   │   ├── schema.ts        # Zod schemas → GameView, inputs/outputs
│   │   ├── actions.ts       # Server Actions (startGame, castVote, endGame, etc.)
│   │   ├── hooks.ts         # useGameState (polling with Zod), useTimer
│   │   ├── logic.ts         # Pure game logic (no DB, no React)
│   │   └── components/      # GameView, Timer, VotePanel, LocationGrid, RevealScreen
│   └── location/
│       ├── schema.ts        # Zod schemas for locations
│       ├── actions.ts       # Server Actions (CRUD for location selections)
│       ├── data.ts          # 54 seed locations
│       └── components/      # LocationSettings dialog
├── shared/                  # Infrastructure + cross-domain concerns
│   ├── lib/                 # prisma, utils, constants, room-code generator
│   ├── ui/                  # shadcn/ui components (base-ui, not radix)
│   ├── hooks/               # useSession (cross-domain)
│   └── types/               # ActionResult<T>, GamePhase, PlayerInfo
└── generated/               # Prisma client (gitignored)
```

## Dependency Direction

```
app/ → domains/ → shared/
```
- **Never** import from `app/` into `domains/` or `shared/`
- **Never** import between domains directly — use `shared/types/`
- Components must not import Prisma — use Server Actions
- ESLint enforces these boundaries

## Commands

```bash
pnpm dev           # Start dev server (Turbopack)
pnpm build         # Production build
pnpm lint          # ESLint
pnpm exec tsc --noEmit # Type-check
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Run migrations
pnpm db:push       # Push schema to DB (no migration)
pnpm db:seed       # Seed locations and roles
pnpm db:studio     # Open Prisma Studio
docker compose up -d  # Start PostgreSQL
docker compose down   # Stop PostgreSQL
```

## Game Logic Reference

Inspired by [adrianocola/spyfall](https://github.com/adrianocola/spyfall):

- **Players**: 3-12 per room
- **Spies**: 1+ per game (configurable)
- **Timer**: Default 8 minutes (configurable)
- **Flow**: LOBBY → PLAYING → VOTING → REVEAL → FINISHED
- **Room codes**: 5-char alphanumeric (no ambiguous chars: no 0/O/1/I)
- **Locations**: 54 built-in (28 edition 1, 26 edition 2), each with 6 roles
- **Spy can guess location** at any time — correct guess = spy wins

## Conventions

### Architecture (SOLID + Clean Architecture)
- **Zod-first types** — all types inferred from Zod schemas via `z.infer<>`. NEVER hand-write interfaces for data crossing boundaries
- **Server Actions for mutations** — all POST/PATCH/DELETE use Server Actions in `domains/*/actions.ts`
- **GET stays as API routes** — SSE and polling endpoints remain in `app/api/`
- **Domain isolation** — domains don't import from each other. Use `shared/types/` for cross-domain types
- **Pure game logic** — `domains/game/logic.ts` has no DB, no React, no Next.js imports
- **ActionResult<T>** — all Server Actions return `{ success: true, data } | { success: false, error }`
- **Validate at boundaries** — Zod `.safeParse()` at every Server Action entry point

### Code Quality
- **No `any`** — use Zod validation or `unknown` with narrowing
- **React.memo** on all leaf components receiving props
- **useCallback** for every function passed as a prop
- **useMemo** for computed arrays/objects derived from state
- **SRP** — each file has one reason to change. Split when too large
- **shadcn/ui uses base-ui** (not radix) — use `render` prop instead of `asChild`
- **Commit often** — background hook auto-commits when 6+ files change

### Infrastructure
- **Database** — `shared/lib/prisma.ts` singleton. Prisma v7 adapter pattern
- **UI** — `shared/ui/` for shadcn components. Import from `@/shared/ui/`
- **Constants** — `shared/lib/constants.ts` for game limits (MIN_PLAYERS, etc.)
- **State transitions** use `prisma.$transaction` for atomicity

### Rules (see `.claude/rules/`)
- `clean-architecture.md` — SOLID, dependency direction, domain structure
- `zod-types.md` — schema conventions, naming, validation patterns
- `server-actions.md` — Server Action patterns, error handling, auth
- `nextjs-optimizations.md` — Suspense, loading/error boundaries, Server Components
- `react-performance.md` — memo, useCallback, useMemo, polling, hydration
- `hooks-patterns.md` — interval refs, SSE reconnection, fetch polling

## Hooks & Automation

This project has a self-improving hook system adapted from the final-medusa project:

### Defense (PreToolUse)
- `guard-env-files.sh` — Blocks .env edits
- `guard-main-branch.sh` — Blocks edits on main/master
- `guard-large-file-read.sh` — Blocks reading 400+ line files without limit/offset
- `pre-push-check.sh` — Validates tsc + lint before git push

### Auto-Correction (PostToolUse)
- `auto-format.sh` — Prettier after edits
- `lint-on-edit.sh` — Per-file ESLint
- `typecheck-on-edit.sh` — Periodic tsc (every 5th edit, 60s cooldown)
- `commit-reminder.sh` — Auto-commits 6+ changed files (headless haiku)

### Error Learning (Self-Improving Loop)
- `capture-errors.sh` — Logs all tool failures to `.claude/learnings/errors.log`
- `compound-learnings.sh` — Analyzes errors at session end, proposes guardrails
- `apply-proposals.sh` — Auto-applies pending hook proposals next session

### Quality Gates
- `quality-sentinel.sh` — Blocks session stop if type errors exist in changed files

## Known Pitfalls

- **UserPromptSubmit hooks must NEVER use `set -e`/`set -u`/`pipefail`** — non-zero exit blocks ALL user prompts
- `next-pwa` uses webpack internally — `turbopack: {}` in next.config.ts silences the compatibility warning
- shadcn Dialog uses base-ui's `render` prop, not radix's `asChild`
- Prisma v7: no `url` in schema datasource — connection string lives in `prisma.config.ts`

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/rooms` | Create room |
| GET | `/api/rooms/[code]` | Get room state |
| POST | `/api/rooms/[code]` | Join room |
| GET | `/api/rooms/[code]/events` | SSE stream for room updates |
| POST | `/api/games` | Start game (host only) |
| GET | `/api/games/[id]?playerId=` | Get game state for player |
| POST | `/api/games/[id]/vote` | Cast vote |
| POST | `/api/games/[id]/end` | End game / spy guess |
| POST | `/api/games/[id]/restart` | Return to lobby |
