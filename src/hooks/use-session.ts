"use client";

import { useState, useCallback } from "react";

interface Session {
  playerId: string;
  roomCode: string;
  roomId: string;
  isHost: boolean;
}

const STORAGE_KEY = "spyfall-session";

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useSession() {
  const [session, setSessionState] = useState<Session | null>(loadSession);

  const setSession = useCallback((s: Session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSessionState(s);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
  }, []);

  return { session, setSession, clearSession };
}
