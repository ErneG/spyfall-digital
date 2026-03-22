import { z } from "zod/v4";
import { gamePhaseSchema, playerSchema } from "@/shared/types/common";

// Re-export shared types for convenience
export { gamePhaseSchema, playerSchema };
export type { GamePhase, PlayerInfo } from "@/shared/types/common";

// ─── Input schemas (for mutations) ──────────────────────────

export const createRoomInput = z.object({
  hostName: z.string().min(1, "Name is required").max(20).trim(),
  timeLimit: z.number().int().min(360).max(600).default(480),
  spyCount: z.number().int().min(1).max(2).default(1),
});
export type CreateRoomInput = z.infer<typeof createRoomInput>;

export const joinRoomInput = z.object({
  playerName: z.string().min(1, "Name is required").max(20).trim(),
  roomCode: z.string().length(5).toUpperCase(),
});
export type JoinRoomInput = z.infer<typeof joinRoomInput>;

export const updateRoomConfigInput = z.object({
  playerId: z.string().min(1),
  timeLimit: z.number().int().min(360).max(600).optional(),
  spyCount: z.number().int().min(1).max(2).optional(),
  autoStartTimer: z.boolean().optional(),
  hideSpyCount: z.boolean().optional(),
  moderatorMode: z.boolean().optional(),
  moderatorLocationId: z.string().nullable().optional(),
});
export type UpdateRoomConfigInput = z.infer<typeof updateRoomConfigInput>;

// ─── Output schemas (for responses) ─────────────────────────

export const createRoomOutput = z.object({
  roomId: z.string(),
  code: z.string(),
  playerId: z.string(),
  timeLimit: z.number(),
  spyCount: z.number(),
});
export type CreateRoomOutput = z.infer<typeof createRoomOutput>;

export const joinRoomOutput = z.object({
  playerId: z.string(),
  roomId: z.string(),
  code: z.string(),
});
export type JoinRoomOutput = z.infer<typeof joinRoomOutput>;

export const roomEventSchema = z.object({
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
  error: z.string().optional(),
});
export type RoomEvent = z.infer<typeof roomEventSchema>;

export const TIMER_PRESETS = [
  { label: "6:00", value: 360 },
  { label: "7:00", value: 420 },
  { label: "8:00", value: 480 },
  { label: "9:00", value: 540 },
  { label: "10:00", value: 600 },
] as const;
