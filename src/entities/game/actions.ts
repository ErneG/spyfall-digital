"use server";

import {
  castVote as domainCastVote,
  endGame as domainEndGame,
  getGameState as domainGetGameState,
  restartGame as domainRestartGame,
  startGame as domainStartGame,
  toggleTimer as domainToggleTimer,
} from "@/domains/game/actions";

export type { StartGameOutput } from "@/domains/game/schema";

export async function castVote(...args: Parameters<typeof domainCastVote>) {
  return domainCastVote(...args);
}

export async function endGame(...args: Parameters<typeof domainEndGame>) {
  return domainEndGame(...args);
}

export async function getGameState(...args: Parameters<typeof domainGetGameState>) {
  return domainGetGameState(...args);
}

export async function restartGame(...args: Parameters<typeof domainRestartGame>) {
  return domainRestartGame(...args);
}

export async function startGame(...args: Parameters<typeof domainStartGame>) {
  return domainStartGame(...args);
}

export async function toggleTimer(...args: Parameters<typeof domainToggleTimer>) {
  return domainToggleTimer(...args);
}
