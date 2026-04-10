"use server";

import { startGame, type StartGameOutput } from "@/domains/game/actions";
import {
  createPassAndPlayInput,
  type CreatePassAndPlayInput,
  type CreatePassAndPlayOutput,
} from "@/domains/room/schema";
import { createPassAndPlayRoom } from "@/entities/room/pass-and-play";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

interface PassAndPlaySessionStartResult {
  game: StartGameOutput;
  room: CreatePassAndPlayOutput;
}

export async function startPassAndPlaySession(
  input: CreatePassAndPlayInput,
): Promise<ActionResult<PassAndPlaySessionStartResult>> {
  const normalizedInput = createPassAndPlayInput.parse(input);
  const roomResult = await createPassAndPlayRoom(normalizedInput);
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
