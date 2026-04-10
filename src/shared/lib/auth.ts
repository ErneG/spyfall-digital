import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { getServerEnv } from "@/shared/config/env";

import { prisma } from "./prisma";

function createAuth() {
  const { BETTER_AUTH_SECRET, BETTER_AUTH_URL } = getServerEnv();

  return betterAuth({
    secret: BETTER_AUTH_SECRET,
    baseURL: BETTER_AUTH_URL,
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    plugins: [nextCookies()],
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        displayName: {
          type: "string",
          required: false,
          defaultValue: null,
        },
      },
    },
  });
}

type BetterAuthInstance = ReturnType<typeof createAuth>;

let cachedAuth: BetterAuthInstance | null = null;

export function getAuth(): BetterAuthInstance {
  if (cachedAuth !== null) {
    return cachedAuth;
  }

  cachedAuth = createAuth();
  return cachedAuth;
}
