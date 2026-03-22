"use client";

import { useState, useCallback } from "react";

interface Session {
  playerId: string;
  roomCode: string;
  roomId: string;
  isHost: boolean;
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

// On the client, the lazy initializer reads localStorage immediately.
// On the server, readSession() returns null. This means the first client
// render may differ from SSR — that's acceptable for session data and
// the consumer gates on `isLoaded` before redirecting.
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
