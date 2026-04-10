import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { getServerEnv } from "@/shared/config/env";

import { prisma } from "./prisma";

const { BETTER_AUTH_SECRET, BETTER_AUTH_URL } = getServerEnv();

export const auth = betterAuth({
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
