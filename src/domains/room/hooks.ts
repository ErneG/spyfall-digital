"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback } from "react";

import { roomEventSchema, type RoomEvent } from "@/domains/room/schema";

// Re-export useSession from shared for backward compatibility
export { useSession } from "@/shared/hooks/use-session";

// ─── Query key factory ──────────────────────────────────────

export const roomKeys = {
  all: ["room"] as const,
  events: (code: string) => ["room", code, "events"] as const,
} as const;

// ─── SSE hook — writes to query cache ───────────────────────

const RECONNECT_DELAY = 3000;
const STALE_TIMEOUT = 10_000; // force reconnect if no message in 10s

/** SSE hook for real-time room state updates. Feeds data into TanStack Query cache. */
export function useRoomEvents(code: string | null) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<() => void>(null);

  const handleMessage = useCallback(
    (es: EventSource, event: MessageEvent<string>, resetStale: () => void) => {
      resetStale();
      try {
        const raw: unknown = JSON.parse(event.data);
        const result = roomEventSchema.safeParse(raw);
        if (!result.success) {
          if (typeof raw === "object" && raw !== null && "error" in raw) {
            es.close();
            setIsConnected(false);
          }
          return;
        }
        if (result.data.error) {
          es.close();
          setIsConnected(false);
          return;
        }
        if (code) {
          queryClient.setQueryData(roomKeys.events(code), result.data);
        }
      } catch {
        // ignore
      }
    },
    [code, queryClient],
  );

  const connect = useCallback(() => {
    if (!code) {
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (staleTimerRef.current) {
      clearTimeout(staleTimerRef.current);
      staleTimerRef.current = null;
    }

    esRef.current?.close();
    const es = new EventSource(`/api/rooms/${code}/events`);
    esRef.current = es;

    const resetStaleTimer = () => {
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
      }
      staleTimerRef.current = setTimeout(() => {
        es.close();
        setIsConnected(false);
        connectRef.current?.();
      }, STALE_TIMEOUT);
    };

    es.onopen = () => {
      setIsConnected(true);
      resetStaleTimer();
    };
    es.onmessage = (event: MessageEvent<string>) => handleMessage(es, event, resetStaleTimer);
    es.onerror = () => {
      setIsConnected(false);
      es.close();
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => connectRef.current?.(), RECONNECT_DELAY);
    };
  }, [code, handleMessage]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
      }
      setIsConnected(false);
    };
  }, [connect]);

  // Reconnect SSE when tab regains focus (handles tab close/reopen, phone lock, etc.)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && code) {
        connect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [code, connect]);

  // Read data from query cache (SSE is the writer, no HTTP fetching)
  const { data = null } = useQuery<RoomEvent | null>({
    queryKey: roomKeys.events(code ?? ""),
    queryFn: () => null,
    enabled: false,
    initialData: null,
  });

  return { data, isConnected };
}
