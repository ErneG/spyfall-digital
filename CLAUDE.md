@AGENTS.md

# Spyfall Digital

A digital adaptation of the social deduction game Spyfall, built as a PWA with Next.js.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Compiler, Server Actions)
- **UI**: shadcn/ui + Tailwind CSS v4 (light-first glassmorphic shell)
- **Database**: PostgreSQL + Prisma 7 (adapter pattern with `@prisma/adapter-pg`)
- **Validation**: Zod 4 (single source of truth for all types)
- **PWA**: Built-in Next.js manifest (`app/manifest.ts`)
- **Real-time**: TanStack Query polling for room and game state
- **Infra**: Docker Compose (PostgreSQL on port 5433)
- **Design**: Stitch MCP + Nano Banana MCP

## Stitch MCP Setup

Stitch MCP (`mcp__stitch__*` tools) requires Google Cloud setup. If tools fail, run `stitch-doctor` first.

**Prerequisites (one-time):**

1. `~/.stitch-mcp/google-cloud-sdk/bin/gcloud auth login`
2. `~/.stitch-mcp/google-cloud-sdk/bin/gcloud auth application-default login`
3. `~/.stitch-mcp/google-cloud-sdk/bin/gcloud config set project gen-lang-client-0797685586`
4. `~/.stitch-mcp/google-cloud-sdk/bin/gcloud auth application-default set-quota-project gen-lang-client-0797685586`
5. `~/.stitch-mcp/google-cloud-sdk/bin/gcloud services enable stitch.googleapis.com`

**If 403 recurs:** re-run steps 2–4, then restart Claude Code.

## Architecture — V2 Feature/Entity Shape

```
src/
├── app/                     # Thin route shells and page composition
│   ├── (shell)/             # Standard app chrome for home, Library, profile
│   ├── (immersive)/         # Focused runtime routes without the global shell
│   ├── play/                # Pass-and-play setup entry
│   ├── room/                # Online room lobby entry
│   └── api/auth/            # Better Auth route
├── features/                # Feature-owned UI and orchestration
│   ├── pass-and-play/
│   ├── online-room/
│   ├── library/
│   └── auth/
├── entities/                # Shared domain behavior and action/query surfaces
│   ├── room/
│   ├── game/
│   ├── library/
│   ├── location/
│   └── auth/
├── shared/                  # Infrastructure, UI primitives, config, hooks, i18n
└── generated/               # Prisma client (gitignored)
```

## Dependency Direction

```
app/ → features/ → entities/ → shared/
```

- **Never** import upward into `app/`, `features/`, or `entities/` from `shared/`
- **Never** import across features — shared concepts belong in `entities/` or `shared/`
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
- **Entity-owned actions** — server actions and query surfaces live under `entities/*`
- **Feature-owned UI** — product orchestration lives under `features/*`
- **Query polling over SSE** — room and game state refresh through TanStack Query polling
- **Pure game logic** — `entities/game/logic.ts` has no DB, no React, no Next.js imports
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
- `turbopack: {}` in next.config.ts enables Turbopack for dev server
- shadcn Dialog uses base-ui's `render` prop, not radix's `asChild`
- Prisma v7: no `url` in schema datasource — connection string lives in `prisma.config.ts`

## API Routes

| Method | Path                 | Description               |
| ------ | -------------------- | ------------------------- |
| ALL    | `/api/auth/[...all]` | Better Auth handler route |

All product reads and mutations otherwise flow through entity-owned action/query surfaces.

## Server Actions

| Entity   | Action                     | Description                        |
| -------- | -------------------------- | ---------------------------------- |
| room     | `createRoom`               | Create a new room                  |
| room     | `joinRoom`                 | Join an existing room              |
| room     | `updateRoomConfig`         | Update room settings (host only)   |
| room     | `createPassAndPlayRoom`    | Create pass-and-play room          |
| room     | `applyRoomContentSource`   | Switch an online room source       |
| game     | `getGameState`             | Get game state for a player        |
| game     | `startGame`                | Start a new game round (host only) |
| game     | `castVote`                 | Cast a vote against a suspect      |
| game     | `endGame`                  | End game / spy guess               |
| game     | `restartGame`              | Return to lobby                    |
| game     | `toggleTimer`              | Pause/resume timer (host only)     |
| location | `getLocations`             | Get locations with selection state |
| location | `updateLocationSelections` | Update location selections         |
| location | `createCustomLocation`     | Create custom location             |
| location | `updateCustomLocation`     | Update custom location             |
| location | `deleteCustomLocation`     | Delete custom location             |
