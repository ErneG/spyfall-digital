"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Auto-cleanup interval hook. Clears on unmount and when delay changes.
 * Pass `null` delay to pause the interval.
 * Returns a `clear` function to stop manually.
 */
export function useInterval(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep callback ref fresh without restarting the interval
  useEffect(() => {
    callbackRef.current = callback;
  });

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    clear();
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, delay);

    return clear;
  }, [delay, clear]);

  return clear;
}
