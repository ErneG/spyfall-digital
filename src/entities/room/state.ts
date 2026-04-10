import { z } from "zod/v4";

import { gamePhaseSchema, playerSchema } from "@/shared/types/common";

export const roomStateSchema = z.object({
  state: gamePhaseSchema,
  players: z.array(playerSchema),
  timeLimit: z.number(),
  spyCount: z.number(),
  autoStartTimer: z.boolean(),
  hideSpyCount: z.boolean(),
  moderatorMode: z.boolean(),
  moderatorLocationId: z.string().nullable(),
  selectedLocationCount: z.number(),
  totalLocationCount: z.number(),
  currentGameId: z.string().nullable(),
  gameStartedAt: z.string().nullable(),
  timerRunning: z.boolean(),
});
export type RoomState = z.infer<typeof roomStateSchema>;

export const roomEventSchema = roomStateSchema.extend({
  error: z.string().optional(),
});
export type RoomEvent = z.infer<typeof roomEventSchema>;
