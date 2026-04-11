import { defineConfig, devices } from "@playwright/test";

const port = 3001;
const baseURL = `http://localhost:${String(port)}`;
const defaultPlaywrightDatabaseUrl =
  "postgresql://spyfall:spyfall@127.0.0.1:5433/spyfall?schema=playwright";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command:
      "pnpm exec prisma generate && pnpm exec prisma db push --force-reset && pnpm db:seed && pnpm exec next dev --hostname localhost --port 3001",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? defaultPlaywrightDatabaseUrl,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "0123456789abcdef0123456789abcdef",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? baseURL,
    },
  },
});
