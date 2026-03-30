import { describe, it, expect } from "vitest";
import { generateRoomCode } from "./room-code";

const AMBIGUOUS_CHARS = ["0", "O", "1", "I"];

describe("generateRoomCode", () => {
  it("generates a 5-character code", () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(5);
  });

  it("generates only uppercase alphanumeric characters", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode();
      expect(code).toMatch(/^[A-Z2-9]+$/);
    }
  });

  it("does not contain ambiguous characters (0, O, 1, I)", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode();
      for (const char of AMBIGUOUS_CHARS) {
        expect(code).not.toContain(char);
      }
    }
  });

  it("generates different codes on successive calls", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      codes.add(generateRoomCode());
    }
    // With 30^5 = 24.3M possibilities, 50 codes should all be unique
    expect(codes.size).toBe(50);
  });
});
