"use server";

import { startGame, type StartGameOutput } from "@/domains/game/actions";
import { createPassAndPlayRoom } from "@/domains/room/actions";
import { type CreatePassAndPlayInput, type CreatePassAndPlayOutput } from "@/domains/room/schema";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

interface PassAndPlaySessionStartResult {
  game: StartGameOutput;
  room: CreatePassAndPlayOutput;
}

export async function startPassAndPlaySession(
  input: CreatePassAndPlayInput,
): Promise<ActionResult<PassAndPlaySessionStartResult>> {
  const roomResult = await createPassAndPlayRoom(input);
  if (!roomResult.success) {
    return fail(roomResult.error);
  }

  const gameResult = await startGame({
    roomId: roomResult.data.roomId,
    playerId: roomResult.data.hostPlayerId,
  });
  if (!gameResult.success) {
    return fail(gameResult.error);
  }

  return ok({
    room: roomResult.data,
    game: gameResult.data,
  });
}
