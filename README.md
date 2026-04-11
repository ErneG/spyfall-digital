# Spyfall Digital

Spyfall Digital is a Next.js 16 multiplayer and pass-and-play implementation of Spyfall. The current revamp prioritizes:

1. a stable, fast pass-and-play experience
2. a proper library for locations, roles, and collections
3. converging online rooms onto the same product and architecture foundation

## Stack

- Next.js 16 App Router
- React 19
- Prisma 7 with PostgreSQL
- TanStack Query
- Storybook 10
- Vitest
- ESLint flat config + Prettier

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the example environment file and update secrets:

```bash
cp .env.example .env
```

3. Start Postgres:

```bash
docker compose up -d postgres
```

4. Generate the Prisma client:

```bash
pnpm db:generate
```

5. Apply migrations:

```bash
pnpm exec prisma migrate deploy
```

6. Seed the built-in locations explicitly:

```bash
pnpm db:seed
```

7. Start the app:

```bash
pnpm dev
```

The app runs on [http://localhost:3000](http://localhost:3000). `BETTER_AUTH_URL` should match that origin in development unless you intentionally proxy the app through a different host or port.

## Environment variables

Required values are validated centrally in `src/shared/config/env.ts`.

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Better Auth secret
- `BETTER_AUTH_URL`: canonical app origin used by Better Auth, defaults to `http://localhost:3000` when omitted

## Quality commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
pnpm format:check
```

## Storybook

Run Storybook locally with:

```bash
pnpm storybook
```

## Docker

`docker compose up --build app` will build the app and run checked migrations first.

Seeding is intentionally separate so production-style deployments do not mutate content on every boot. To seed a local Docker environment:

```bash
docker compose run --rm seed
```

## Deployment notes

- Production deploys must use Prisma migrations, not `db push --accept-data-loss`.
- Set `BETTER_AUTH_URL` to the public origin that serves the app.
- Run `pnpm db:seed` only when you explicitly want to load the built-in catalog into a target environment.

## Engineering guardrails

- Read [docs/engineering/conventions.md](docs/engineering/conventions.md) before adding new modules or routes.
- Keep route files thin and server-first.
- Add `"use client"` only where interactivity requires it.
