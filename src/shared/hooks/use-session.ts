"use client";

import { useState, useCallback } from "react";

export interface Session {
  playerId: string;
  roomCode: string;
  roomId: string;
  isHost: boolean;
  passAndPlay?: boolean;
  allPlayers?: Array<{ id: string; name: string }>;
}

const STORAGE_KEY = "spyfall-session";

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {
    // ignore
  }
  return null;
}

const isClient = typeof window !== "undefined";

export function useSession() {
  const [session, setSessionState] = useState<Session | null>(() => readSession());

  const setSession = useCallback((newSession: Session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSessionState(newSession);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
  }, []);

  return { session, setSession, clearSession, isLoaded: isClient };
}
