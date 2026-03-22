"use client";

import { useState, useCallback, useEffect } from "react";

interface Session {
  playerId: string;
  roomCode: string;
  roomId: string;
  isHost: boolean;
}

const STORAGE_KEY = "spyfall-session";

export function useSession() {
  // Initialize as null to avoid hydration mismatch — load in useEffect
  const [session, setSessionState] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSessionState(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const setSession = useCallback((s: Session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSessionState(s);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
  }, []);

  return { session, setSession, clearSession, loaded };
}
