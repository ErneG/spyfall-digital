import { type Session } from "@/shared/hooks/use-session";

import { type RoomState } from "./state";

export function getPassAndPlayAutoStartRequest(
  session: Session | null,
  room: RoomState | null,
  isAutoStartPending: boolean,
): { playerId: string; roomId: string } | null {
  if (session?.mode !== "pass-and-play" || isAutoStartPending) {
    return null;
  }

  if (!room || room.state !== "LOBBY") {
    return null;
  }

  return {
    roomId: session.roomId,
    playerId: session.playerId,
  };
}
