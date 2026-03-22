@AGENTS.md

# Spyfall Digital

A digital adaptation of the social deduction game Spyfall, built as a PWA with Next.js.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Compiler enabled)
- **UI**: shadcn/ui + Tailwind CSS v4 (dark mode by default)
- **Database**: PostgreSQL + Prisma 7 (adapter pattern with `@prisma/adapter-pg`)
- **PWA**: @ducanh2912/next-pwa
- **Real-time**: SSE (Server-Sent Events) for room state, polling for game state
- **Design tooling**: Stitch MCP (Google Stitch design proxy)
- **Asset generation**: Nano Banana MCP (AI image generation)
- **Infra**: Docker Compose (PostgreSQL on port 5433)

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── room/[code]/  # Room lobby + active game page
│   └── api/          # REST API routes
│       ├── rooms/    # Room CRUD + SSE events
│       └── games/    # Game lifecycle (start, vote, end, restart)
├── components/
│   ├── ui/           # shadcn/ui primitives (base-ui, not radix)
│   └── game/         # In-game components (timer, location-grid, vote-panel, reveal)
├── data/             # Static data (46 location seeds)
├── hooks/            # Custom React hooks (useRoomEvents, useGameState, useTimer, useSession)
├── lib/              # Utilities (prisma client, game logic)
├── types/            # TypeScript type definitions
└── generated/        # Prisma generated client (gitignored)
```

## Commands

```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # Production build
npm run lint          # ESLint
npx tsc --noEmit      # Type-check
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:push       # Push schema to DB (no migration)
npm run db:seed       # Seed locations and roles
npm run db:studio     # Open Prisma Studio
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
- **Locations**: 46 built-in (28 edition 1, 18 edition 2), each with 6 roles
- **Spy can guess location** at any time — correct guess = spy wins

## Conventions

- **Check proposals on start** — If `.claude/proposals/` has files, review and apply approved ones
- **Search before fix** — Grep all affected files before refactoring (see `.claude/rules/`)
- **Use shadcn/ui components** for all UI — don't write raw HTML elements
- **Dark mode is default** — the `dark` class is on `<html>`
- **All database access** goes through `src/lib/prisma.ts` singleton
- **Prisma v7** requires adapter: `new PrismaClient({ adapter: new PrismaPg(...) })`
- **Import Prisma from** `@/generated/prisma/client` (not `@/generated/prisma`)
- **Game logic** lives in `src/lib/game-logic.ts` — keep it framework-agnostic, pure functions
- **Types** in `src/types/` — Prisma types for DB, custom types for client state
- **API routes** return JSON with consistent error shape: `{ error: string }`
- **State transitions** (game phase changes) use `prisma.$transaction` for atomicity
- **No `any`** — use specific types, generics, or `unknown` with narrowing
- **Commit often** — a background hook auto-commits when 6+ files change without recent commit
- **shadcn/ui uses base-ui** (not radix) — use `render` prop instead of `asChild`

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
