"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getPassAndPlayRuntimeRoute } from "@/features/pass-and-play/routes";

import { RoomLobby, RoomLoadingSpinner } from "./room-page-parts";
import { getOnlineRoomRuntimeRoute } from "./routes";
import { useRoomPage } from "./use-room-page";

interface RoomPageClientProps {
  code: string;
}

export function RoomPageClient({ code }: RoomPageClientProps) {
  const router = useRouter();
  const state = useRoomPage(code);
  const { t, session, isLoaded, room } = state;

  useEffect(() => {
    if (session?.mode === "pass-and-play") {
      router.replace(getPassAndPlayRuntimeRoute(code));
    }

    if (session?.mode === "online" && room && room.state !== "LOBBY" && room.currentGameId) {
      router.replace(getOnlineRoomRuntimeRoute(code));
    }
  }, [code, room, router, session]);

  if (!isLoaded || !session) {
    return null;
  }

  if (session.mode === "pass-and-play") {
    return <RoomLoadingSpinner label={t.common.loading} />;
  }

  if (room && room.state !== "LOBBY" && room.currentGameId) {
    return <RoomLoadingSpinner label={t.common.loading} />;
  }

  if (!room) {
    return <RoomLoadingSpinner label={t.common.loading} />;
  }

  return <RoomLobby code={code} state={state} />;
}
