import type { ActionResult } from "@/shared/types/action-result";

/** Unwrap an ActionResult for use with TanStack Query mutations.
 *  Throws on failure so useMutation's onError fires. */
export function unwrapAction<T>(result: ActionResult<T>): T {
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
