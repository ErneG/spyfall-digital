"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { startGame } from "@/entities/game/actions";
import { useRoomState } from "@/entities/room/query";
import { getPassAndPlayAutoStartRequest } from "@/entities/room/runtime";
import { useSession } from "@/shared/hooks/use-session";
import { useTranslation } from "@/shared/i18n/context";
import { unwrapAction } from "@/shared/lib/unwrap-action";

export function usePassAndPlayRoomPage(code: string) {
  const normalizedCode = code.toUpperCase();
  const router = useRouter();
  const { t } = useTranslation();
  const { session, setSession, isLoaded } = useSession();
  const { data: room, isConnected } = useRoomState(normalizedCode);
  const autoStartRef = useRef(false);

  const startGameMutation = useMutation({
    mutationFn: async ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const result = await startGame({ roomId, playerId });
      return unwrapAction(result);
    },
    onSuccess: (game) => {
      if (session?.mode !== "pass-and-play") {
        return;
      }

      setSession({
        ...session,
        resume: {
          ...session.resume,
          gameId: game.gameId,
          gameStartedAt: game.startedAt,
        },
      });
    },
  });

  useEffect(() => {
    if (!isLoaded || !session) {
      return;
    }

    if (session.roomCode !== normalizedCode) {
      router.replace("/");
      return;
    }

    if (session.mode === "online") {
      router.replace(`/room/${normalizedCode}`);
    }
  }, [isLoaded, normalizedCode, router, session]);

  useEffect(() => {
    const autoStartRequest = getPassAndPlayAutoStartRequest(session, room, autoStartRef.current);
    if (!autoStartRequest) {
      return;
    }

    autoStartRef.current = true;
    startGameMutation.mutate(autoStartRequest, {
      onSettled: () => {
        autoStartRef.current = false;
      },
    });
  }, [room, session, startGameMutation]);

  return {
    isConnected,
    isLoaded,
    room,
    session,
    startGameMutation,
    t,
  };
}
