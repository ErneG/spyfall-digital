"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PlayerInfo, GamePhase } from "@/types/game";

interface RoomEvent {
  state: GamePhase;
  players: PlayerInfo[];
  timeLimit: number;
  spyCount: number;
  currentGameId: string | null;
  gameStartedAt: string | null;
  error?: string;
}

export function useRoomEvents(code: string | null) {
  const [data, setData] = useState<RoomEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!code) return;

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
        // ignore malformed data
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Auto-reconnect after 3s
      setTimeout(connect, 3000);
    };
  }, [code]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      setConnected(false);
    };
  }, [connect]);

  return { data, connected };
}
