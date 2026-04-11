"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useRoomState } from "@/entities/room/query";
import { getPassAndPlayRuntimeRoute } from "@/features/pass-and-play/routes";
import { useSession } from "@/shared/hooks/use-session";
import { useTranslation } from "@/shared/i18n/context";

import { getOnlineRoomLobbyRoute } from "../routes";

export function useOnlineRoomRuntime(code: string) {
  const normalizedCode = code.toUpperCase();
  const router = useRouter();
  const { t } = useTranslation();
  const { session, isLoaded } = useSession();
  const { data: room } = useRoomState(normalizedCode);

  useEffect(() => {
    if (!isLoaded || !session) {
      return;
    }

    if (session.roomCode !== normalizedCode) {
      router.replace("/");
      return;
    }

    if (session.mode === "pass-and-play") {
      router.replace(getPassAndPlayRuntimeRoute(normalizedCode));
      return;
    }

    if (room && (room.state === "LOBBY" || !room.currentGameId)) {
      router.replace(getOnlineRoomLobbyRoute(normalizedCode));
    }
  }, [isLoaded, normalizedCode, room, router, session]);

  return {
    isLoaded,
    room,
    session,
    t,
  };
}
