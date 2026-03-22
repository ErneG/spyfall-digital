---
description: Prisma and database conventions for this project
globs: prisma/**,src/lib/prisma.ts,src/app/api/**
---

- All database access goes through `src/lib/prisma.ts` singleton — never create new PrismaClient instances
- Prisma v7 uses adapter pattern — PrismaClient requires `{ adapter: new PrismaPg(...) }`
- Schema changes: edit `prisma/schema.prisma`, then run `npm run db:push` (dev) or `npm run db:migrate` (prod)
- After schema changes: run `npm run db:generate` to regenerate the client
- Import from `@/generated/prisma/client` (not `@/generated/prisma`)
- Use transactions (`prisma.$transaction`) for multi-table updates in game state transitions
