"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

interface Session {
  playerId: string;
  roomCode: string;
  roomId: string;
  isHost: boolean;
}

const STORAGE_KEY = "spyfall-session";

function getSnapshot(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {
    // ignore
  }
  return null;
}

function getServerSnapshot(): Session | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mark loaded after first client render
  if (typeof window !== "undefined" && !isLoaded) {
    setIsLoaded(true);
  }

  const setSession = useCallback((s: Session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    // Trigger re-render by dispatching storage event won't work same-window
    // Force re-render via state update
    window.dispatchEvent(new Event("storage"));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("storage"));
  }, []);

  return { session, setSession, clearSession, isLoaded };
}
