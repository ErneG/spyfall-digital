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
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!code) return;

    // Clear any pending reconnect
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }

    esRef.current?.close();
    const es = new EventSource(`/api/rooms/${code}/events`);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as RoomEvent;
        if (parsed.error) {
          es.close();
          setConnected(false);
          return;
        }
        setData(parsed);
      } catch {
        // ignore
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Single reconnect — clear any previous before scheduling
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(connect, 3000);
    };
  }, [code]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      setConnected(false);
    };
  }, [connect]);

  return { data, connected };
}
