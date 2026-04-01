"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Auto-cleanup timeout hook. Clears on unmount and when delay changes.
 * Pass `null` delay to disable.
 * Returns a `clear` function to cancel manually.
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback ref fresh without restarting the timer
  useEffect(() => {
    callbackRef.current = callback;
  });

  const clear = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    clear();
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);

    return clear;
  }, [delay, clear]);

  return clear;
}
