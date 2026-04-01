"use client";

import { useState, useCallback } from "react";
import { z } from "zod/v4";

export const sessionSchema = z.object({
  playerId: z.string(),
  roomCode: z.string(),
  roomId: z.string(),
  isHost: z.boolean(),
  passAndPlay: z.boolean().optional(),
  allPlayers: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
});

export type Session = z.infer<typeof sessionSchema>;

const STORAGE_KEY = "spyfall-session";

function readSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = sessionSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        return parsed.data;
      }
      // Corrupted session data — clear it
      localStorage.removeItem(STORAGE_KEY);
    }
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
