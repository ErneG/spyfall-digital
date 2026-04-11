"use client";

import { useCallback, useSyncExternalStore } from "react";
import { z } from "zod/v4";

const sessionPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const baseSessionSchema = z.object({
  playerId: z.string(),
  roomCode: z.string(),
  roomId: z.string(),
  isHost: z.boolean(),
});

const passAndPlayResumeSchema = z.object({
  players: z.array(sessionPlayerSchema),
  gameId: z.string(),
  gameStartedAt: z.string().nullable(),
  timeLimit: z.number(),
  spyCount: z.number(),
  hideSpyCount: z.boolean(),
});

const onlineSessionSchema = baseSessionSchema.extend({
  mode: z.literal("online"),
});

const passAndPlaySessionSchema = baseSessionSchema.extend({
  mode: z.literal("pass-and-play"),
  resume: passAndPlayResumeSchema,
});

export const sessionSchema = z.discriminatedUnion("mode", [
  onlineSessionSchema,
  passAndPlaySessionSchema,
]);

export type Session = z.infer<typeof sessionSchema>;

const STORAGE_KEY = "spyfall-session";
const isClient = typeof window !== "undefined";
const sessionListeners = new Set<() => void>();
let cachedSerializedSession: string | null = null;
let cachedSessionSnapshot: Session | null = null;

function emitSessionChange() {
  for (const listener of sessionListeners) {
    listener();
  }
}

function normalizeLegacySession(raw: unknown): Session | null {
  const parsedSession = sessionSchema.safeParse(raw);
  if (parsedSession.success) {
    return parsedSession.data;
  }

  const legacyOnline = baseSessionSchema.safeParse(raw);
  if (legacyOnline.success) {
    const passAndPlay = z
      .object({
        passAndPlay: z.literal(true),
        allPlayers: z.array(sessionPlayerSchema),
        gameId: z.string(),
        gameStartedAt: z.string().nullable().optional(),
        timeLimit: z.number(),
        spyCount: z.number(),
        hideSpyCount: z.boolean(),
      })
      .safeParse(raw);

    if (passAndPlay.success) {
      return {
        mode: "pass-and-play",
        ...legacyOnline.data,
        resume: {
          players: passAndPlay.data.allPlayers,
          gameId: passAndPlay.data.gameId,
          gameStartedAt: passAndPlay.data.gameStartedAt ?? null,
          timeLimit: passAndPlay.data.timeLimit,
          spyCount: passAndPlay.data.spyCount,
          hideSpyCount: passAndPlay.data.hideSpyCount,
        },
      };
    }

    return {
      mode: "online",
      ...legacyOnline.data,
    };
  }

  return null;
}

function readSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedSerializedSession) {
      return cachedSessionSnapshot;
    }

    if (raw) {
      const normalized = normalizeLegacySession(JSON.parse(raw));
      if (normalized) {
        cachedSerializedSession = raw;
        cachedSessionSnapshot = normalized;
        return normalized;
      }
      // Corrupted session data — clear it
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }

  cachedSerializedSession = null;
  cachedSessionSnapshot = null;
  return null;
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) {
    return;
  }

  emitSessionChange();
}

function subscribeToSession(listener: () => void) {
  sessionListeners.add(listener);

  if (sessionListeners.size === 1 && isClient) {
    window.addEventListener("storage", handleStorageChange);
  }

  return () => {
    sessionListeners.delete(listener);

    if (sessionListeners.size === 0 && isClient) {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

function writeSession(session: Session) {
  const serializedSession = JSON.stringify(session);
  cachedSerializedSession = serializedSession;
  cachedSessionSnapshot = session;
  localStorage.setItem(STORAGE_KEY, serializedSession);
  emitSessionChange();
}

function removeSession() {
  cachedSerializedSession = null;
  cachedSessionSnapshot = null;
  localStorage.removeItem(STORAGE_KEY);
  emitSessionChange();
}

export function useSession() {
  const session = useSyncExternalStore(subscribeToSession, readSession, () => null);

  const setSession = useCallback((newSession: Session) => {
    writeSession(newSession);
  }, []);

  const clearSession = useCallback(() => {
    removeSession();
  }, []);

  return { session, setSession, clearSession, isLoaded: isClient };
}
