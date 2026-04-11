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

# ─── Production image ────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["sh", "-c", "pnpm db:prepare:production && node server.js"]
