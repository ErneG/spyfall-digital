"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

import { unwrapAction } from "@/shared/lib/unwrap-action";
import { type ActionResult } from "@/shared/types/action-result";

interface ServerMutationOptions<TOutput> {
  /** Query keys to invalidate on success */
  invalidateKeys?: QueryKey[];
  /** Called with the unwrapped data on success */
  onSuccess?: (data: TOutput) => void;
  /** Called with the error on failure */
  onError?: (error: Error) => void;
}

/**
 * Wraps a server action in useMutation with automatic unwrapAction + query invalidation.
 *
 * @example
 * ```tsx
 * const mutation = useServerMutation(castVote, {
 *   invalidateKeys: [gameKeys.state(gameId, playerId)],
 *   onError: (err) => setError(err.message),
 * });
 *
 * mutation.mutate({ gameId, voterId: playerId, suspectId });
 * ```
 */
export function useServerMutation<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionResult<TOutput>>,
  options?: ServerMutationOptions<TOutput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      const result = await action(input);
      return unwrapAction(result);
    },
    onSuccess: (data) => {
      if (options?.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          void queryClient.invalidateQueries({ queryKey: key });
        }
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
