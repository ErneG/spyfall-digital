"use server";

export {
  castVote,
  endGame,
  getGameState,
  restartGame,
  startGame,
  toggleTimer,
} from "@/domains/game/actions";

export type { StartGameOutput } from "@/domains/game/schema";
