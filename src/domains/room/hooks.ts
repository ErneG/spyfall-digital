"use client";

import { useQuery } from "@tanstack/react-query";

import { getRoomState } from "@/domains/room/actions";
import { type RoomState } from "@/domains/room/schema";
import { unwrapAction } from "@/shared/lib/unwrap-action";

// Re-export useSession from shared for backward compatibility
export { useSession } from "@/shared/hooks/use-session";

const ROOM_STATE_POLL_INTERVAL = 1500;

export const roomKeys = {
  all: ["room"] as const,
  state: (code: string) => ["room", code.toUpperCase(), "state"] as const,
} as const;

async function fetchRoomState(code: string): Promise<RoomState> {
  const result = await getRoomState({ roomCode: code });
  return unwrapAction(result);
}

export function useRoomState(code: string | null) {
  const normalizedCode = code?.toUpperCase() ?? "";
  const query = useQuery({
    queryKey: roomKeys.state(normalizedCode),
    queryFn: async () => {
      if (!normalizedCode) {
        throw new Error("Room code is required");
      }

      return fetchRoomState(normalizedCode);
    },
    enabled: Boolean(normalizedCode),
    refetchInterval: ROOM_STATE_POLL_INTERVAL,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    data: query.data ?? null,
    isConnected: !query.isError,
    isLoading: query.isLoading,
  };
}
