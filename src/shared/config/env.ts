import { z } from "zod/v4";

export const DEFAULT_BETTER_AUTH_URL = "http://localhost:3000";

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z
    .string()
    .url("BETTER_AUTH_URL must be a valid URL")
    .default(DEFAULT_BETTER_AUTH_URL),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedServerEnv: ServerEnv | undefined;

function formatEnvIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");
}

export function parseServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid server environment: ${formatEnvIssues(parsed.error)}`);
  }
  return parsed.data;
}

export function getServerEnv(source?: Record<string, string | undefined>): ServerEnv {
  if (source) {
    return parseServerEnv(source);
  }
  cachedServerEnv ??= parseServerEnv();
  return cachedServerEnv;
}
