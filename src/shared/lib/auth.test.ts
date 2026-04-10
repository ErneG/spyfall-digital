// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const REQUIRED_ENV_KEYS = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"] as const;

const originalEnv = Object.fromEntries(
  REQUIRED_ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof REQUIRED_ENV_KEYS)[number], string | undefined>;

describe("auth env loading", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();

    for (const key of REQUIRED_ENV_KEYS) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of REQUIRED_ENV_KEYS) {
      const value = originalEnv[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("does not validate env during module import", async () => {
    await expect(import("./auth")).resolves.toHaveProperty("getAuth");
  });

  it("throws when auth is requested without required env", async () => {
    const { getAuth } = await import("./auth");

    expect(() => getAuth()).toThrow(/Invalid server environment/);
  });
});
