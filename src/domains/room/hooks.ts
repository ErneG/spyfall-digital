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

/** SSE hook for real-time room state updates. Feeds data into TanStack Query cache. */
export function useRoomEvents(code: string | null) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<() => void>(null);

  const connect = useCallback(() => {
    if (!code) {
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    esRef.current?.close();
    const es = new EventSource(`/api/rooms/${code}/events`);
    esRef.current = es;

    es.onopen = () => setIsConnected(true);

    es.onmessage = (event: MessageEvent<string>) => {
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
        // Write validated data into query cache
        queryClient.setQueryData(roomKeys.events(code), result.data);
      } catch {
        // ignore
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => connectRef.current?.(), RECONNECT_DELAY);
    };
  }, [code, queryClient]);

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
    enabled: false,
    initialData: null,
  });

  return { data, isConnected };
}
