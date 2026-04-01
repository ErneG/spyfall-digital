import { type ZodType } from "zod/v4";

import { prisma } from "@/shared/lib/prisma";
import { ok, fail, type ActionResult } from "@/shared/types/action-result";

// ─── Input Validation ─────────────────────────────────────────

/** Parse and validate input against a Zod schema, returning ActionResult. */
export function parseInput<T>(schema: ZodType<T>, input: unknown): ActionResult<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  return ok(parsed.data);
}

// ─── Room Access Guards ───────────────────────────────────────

/** Fetch a room by code or return fail. */
export async function requireRoom(code: string) {
  const room = await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: { players: true },
  });
  if (!room) {
    return fail("Room not found");
  }
  return ok(room);
}

/** Fetch a room and verify the player is the host, or return fail. */
export async function requireHost(code: string, playerId: string) {
  const result = await requireRoom(code);
  if (!result.success) {
    return result;
  }
  if (result.data.hostId !== playerId) {
    return fail("Only the host can do this");
  }
  return result;
}

// ─── Action Wrapper ───────────────────────────────────────────

/**
 * Create a server action with automatic input validation and error handling.
 *
 * @param schema - Zod schema to validate input
 * @param handler - Async function that receives validated data and returns the result
 * @param actionName - Name used in error logs (e.g. "createRoom")
 *
 * @example
 * ```ts
 * export const createRoom = createAction(
 *   createRoomInput,
 *   async (data) => {
 *     const room = await prisma.room.create({ data });
 *     return { roomId: room.id };
 *   },
 *   "createRoom",
 * );
 * ```
 */
export function createAction<TInput, TOutput>(
  schema: ZodType<TInput>,
  handler: (data: TInput) => Promise<TOutput>,
  actionName: string,
): (input: TInput) => Promise<ActionResult<TOutput>> {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    const parsed = parseInput(schema, input);
    if (!parsed.success) {
      return parsed;
    }

    try {
      const result = await handler(parsed.data);
      return ok(result);
    } catch (error: unknown) {
      console.error(`${actionName} failed:`, error);
      return fail(
        `Failed to ${actionName
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()
          .trim()}`,
      );
    }
  };
}
