"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PlayerInfo, GamePhase } from "@/types/game";

interface RoomEvent {
  state: GamePhase;
  players: PlayerInfo[];
  timeLimit: number;
  spyCount: number;
  autoStartTimer: boolean;
  hideSpyCount: boolean;
  moderatorMode: boolean;
  moderatorLocationId: string | null;
  selectedLocationCount: number;
  totalLocationCount: number;
  currentGameId: string | null;
  gameStartedAt: string | null;
  timerRunning: boolean;
  error?: string;
}

export function useRoomEvents(code: string | null) {
  const [data, setData] = useState<RoomEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<() => void>(null);

  const connect = useCallback(() => {
    if (!code) return;

    // Clear any pending reconnect
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
        const parsed = JSON.parse(event.data) as RoomEvent;
        if (parsed.error) {
          es.close();
          setIsConnected(false);
          return;
        }
        setData(parsed);
      } catch {
        // ignore
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      // Single reconnect — clear any previous before scheduling
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
