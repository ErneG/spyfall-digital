import { describe, expect, it } from "vitest";

import { DEFAULT_BETTER_AUTH_URL, parseServerEnv } from "./env";

describe("parseServerEnv", () => {
  it("accepts a complete environment", () => {
    const env = parseServerEnv({
      DATABASE_URL: "postgresql://spyfall:spyfall@localhost:5433/spyfall",
      BETTER_AUTH_SECRET: "secret-value",
      BETTER_AUTH_URL: "http://localhost:3000",
    });

    expect(env).toEqual({
      DATABASE_URL: "postgresql://spyfall:spyfall@localhost:5433/spyfall",
      BETTER_AUTH_SECRET: "secret-value",
      BETTER_AUTH_URL: "http://localhost:3000",
    });
  });

  it("defaults the auth url to the local app origin", () => {
    const env = parseServerEnv({
      DATABASE_URL: "postgresql://spyfall:spyfall@localhost:5433/spyfall",
      BETTER_AUTH_SECRET: "secret-value",
    });

    expect(env.BETTER_AUTH_URL).toBe(DEFAULT_BETTER_AUTH_URL);
  });

  it("throws when required values are missing", () => {
    expect(() =>
      parseServerEnv({
        BETTER_AUTH_SECRET: "secret-value",
      }),
    ).toThrow(/DATABASE_URL/);
  });
});
