"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";

import { startGame } from "@/domains/game/actions";
import { useRoomEvents } from "@/domains/room/hooks";
import { useSession } from "@/shared/hooks/use-session";
import { useTranslation } from "@/shared/i18n/context";
import { unwrapAction } from "@/shared/lib/unwrap-action";

const EMPTY_PLAYERS: never[] = [];

export function useRoomPage(code: string) {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, clearSession, isLoaded } = useSession();
  const { data: room, isConnected } = useRoomEvents(code);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoStartRef = useRef(false);

  const startGameMutation = useMutation({
    mutationFn: async ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const result = await startGame({ roomId, playerId });
      return unwrapAction(result);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  useEffect(() => {
    if (isLoaded && (!session || session.roomCode !== code.toUpperCase())) {
      router.push("/");
    }
  }, [isLoaded, session, code, router]);

  // Auto-start new game for pass-and-play when room returns to LOBBY (after "Play Again")
  useEffect(() => {
    if (!session?.passAndPlay || !room || room.state !== "LOBBY" || autoStartRef.current) {
      return;
    }
    autoStartRef.current = true;
    startGameMutation.mutate(
      { roomId: session.roomId, playerId: session.playerId },
      {
        onSettled: () => {
          autoStartRef.current = false;
        },
      },
    );
  }, [session, room, startGameMutation]);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code.toUpperCase());
    setIsCopied(true);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
  }, [code]);

  const handleLeave = useCallback(() => {
    clearSession();
    router.push("/");
  }, [clearSession, router]);

  const handleOpenLocations = useCallback(() => setIsLocationsOpen(true), []);

  const handleStartClick = useCallback(() => {
    if (!session) {
      return;
    }
    setError("");
    startGameMutation.mutate({ roomId: session.roomId, playerId: session.playerId });
  }, [session, startGameMutation]);

  const players = room?.players ?? EMPTY_PLAYERS;

  return {
    t,
    session,
    isLoaded,
    room,
    isConnected,
    isCopied,
    error,
    isLocationsOpen,
    setIsLocationsOpen,
    startGameMutation,
    players,
    handleCopy,
    handleLeave,
    handleOpenLocations,
    handleStartClick,
  };
}
