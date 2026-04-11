FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ─── Install dependencies ────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# ─── Generate Prisma client + Build ─────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm db:generate
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy URL so Next.js can compile server actions without a real DB connection
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN pnpm build

# ─── Migration runner ───────────────────────────────────────
# Uses `prisma db push` for idempotent schema sync: works on both fresh
# databases and those already populated by prior `db push` runs, without
# requiring a `_prisma_migrations` baseline to exist.
FROM deps AS migrator
WORKDIR /app
COPY . .
RUN pnpm db:generate
CMD ["pnpm", "exec", "prisma", "db", "push"]

# ─── Production image ────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
