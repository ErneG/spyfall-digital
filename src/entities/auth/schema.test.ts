import { describe, expect, it } from "vitest";

import { signInInput, signUpInput } from "./schema";

describe("auth entity schema exports", () => {
  it("keeps sign-in and sign-up validation available through the entity layer", () => {
    expect(signInInput.parse({ email: "nova@example.com", password: "password123" })).toEqual({
      email: "nova@example.com",
      password: "password123",
    });
    expect(
      signUpInput.parse({
        name: "Nova",
        email: "nova@example.com",
        password: "password123",
      }),
    ).toEqual({
      name: "Nova",
      email: "nova@example.com",
      password: "password123",
    });
  });
});
