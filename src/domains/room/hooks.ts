"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { roomEventSchema, type RoomEvent } from "@/domains/room/schema";

// Re-export useSession from shared for backward compatibility
export { useSession } from "@/shared/hooks/use-session";

/** SSE hook for real-time room state updates. Validates with Zod. */
export function useRoomEvents(code: string | null) {
  const [data, setData] = useState<RoomEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<() => void>(null);

  const connect = useCallback(() => {
    if (!code) return;

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
        setData(result.data);
      } catch {
        // ignore
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => connectRef.current?.(), 3000);
    };
  }, [code]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      setIsConnected(false);
    };
  }, [connect]);

  return { data, isConnected };
}
