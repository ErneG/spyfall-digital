import { z } from "zod/v4";

import { gamePhaseSchema, playerSchema } from "@/shared/types/common";

export const startGameInput = z.object({
  roomId: z.string().min(1),
  playerId: z.string().min(1),
});
export type StartGameInput = z.infer<typeof startGameInput>;

export const castVoteInput = z.object({
  gameId: z.string().min(1),
  voterId: z.string().min(1),
  suspectId: z.string().min(1),
});
export type CastVoteInput = z.infer<typeof castVoteInput>;

export const endGameInput = z.object({
  gameId: z.string().min(1),
  playerId: z.string().min(1),
  spyGuessLocationId: z.string().optional(),
});
export type EndGameInput = z.infer<typeof endGameInput>;

export const restartGameInput = z.object({
  gameId: z.string().min(1),
  playerId: z.string().min(1),
});
export type RestartGameInput = z.infer<typeof restartGameInput>;

export const timerToggleInput = z.object({
  gameId: z.string().min(1),
  playerId: z.string().min(1),
  action: z.enum(["pause", "resume"]),
});
export type TimerToggleInput = z.infer<typeof timerToggleInput>;

export const locationInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable().optional(),
});
export type LocationInfo = z.infer<typeof locationInfoSchema>;

export const gameViewSchema = z.object({
  gameId: z.string(),
  phase: gamePhaseSchema,
  myRole: z.string(),
  isSpy: z.boolean(),
  location: z.string().nullable(),
  allLocations: z.array(locationInfoSchema),
  players: z.array(playerSchema),
  timeRemaining: z.number(),
  timeLimit: z.number(),
  startedAt: z.string(),
  timerRunning: z.boolean(),
  hideSpyCount: z.boolean(),
  spyCount: z.number(),
  prevLocationName: z.string().nullable(),
  votes: z.array(z.object({ voterId: z.string(), suspectId: z.string() })).optional(),
  spies: z.array(z.string()).optional(),
  revealedLocation: z.string().optional(),
});
export type GameView = z.infer<typeof gameViewSchema>;

export const startGameOutput = z.object({
  gameId: z.string(),
  state: z.string(),
  startedAt: z.string(),
  timerRunning: z.boolean(),
});
export type StartGameOutput = z.infer<typeof startGameOutput>;
