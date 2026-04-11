## Spyfall Digital

Spyfall Digital is a Next.js 16 social deduction game with Prisma/Postgres, pass-and-play support, online rooms, and a user-editable library of locations and collections.

## Getting Started

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database

Generate the Prisma client, apply local schema changes, and seed the built-in location catalog:

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## Docker and Coolify Deployments

The production container prepares the database automatically before the app starts:

1. `pnpm db:generate`
2. `pnpm exec prisma migrate deploy` when checked Prisma migrations exist
3. otherwise `pnpm exec prisma db push`
4. `pnpm db:seed`

That logic lives in [`scripts/prepare-production-db.mjs`](/Users/ernestsdane/Documents/GitHub/spyfall-digital/scripts/prepare-production-db.mjs) and is shared by the Docker image and `docker-compose`.

Deployment notes:

- `PRISMA_DEPLOY_STRATEGY=auto` is the default and recommended value for Coolify.
- `PRISMA_DEPLOY_STRATEGY=migrate` forces `prisma migrate deploy`.
- `PRISMA_DEPLOY_STRATEGY=push` forces `prisma db push`.
- Checked Prisma migrations now live under `prisma/migrations`, so `auto` will use `migrate deploy` during Docker/Coolify startup.
- If a database was already populated before this baseline migration existed, run `pnpm exec prisma migrate resolve --applied 0_init` once against that database before switching deployments to `migrate deploy`.

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
