import { z } from "zod/v4";

/** Game phase — shared across room and game domains */
export const gamePhaseSchema = z.enum(["LOBBY", "PLAYING", "VOTING", "REVEAL", "FINISHED"]);
export type GamePhase = z.infer<typeof gamePhaseSchema>;

/** Player info — shared across all domains */
export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  isHost: z.boolean(),
  isOnline: z.boolean(),
  moderatorRole: z.string().nullable().optional(),
});
export type PlayerInfo = z.infer<typeof playerSchema>;
