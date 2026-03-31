/**
 * Core Spyfall game logic — inspired by adrianocola/spyfall
 *
 * Game flow:
 * 1. Host creates a room → players join via room code
 * 2. Host starts the game → a location is randomly selected
 * 3. Each player is assigned a role at that location, except the spy(s)
 * 4. Players take turns asking each other questions to deduce who the spy is
 * 5. The spy tries to figure out the location from the questions
 * 6. Players can call a vote to accuse someone of being the spy
 * 7. If the spy is caught → players win. If timer runs out → spy wins.
 *    The spy can also guess the location at any time — correct guess = spy wins.
 */

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface RoleAssignment {
  playerId: string;
  role: string;
  isSpy: boolean;
}

interface ModeratorPreAssignment {
  playerId: string;
  role: string; // "SPY" or a location role name
}

/**
 * Assign roles to players for a game round.
 * Supports moderator pre-assignments where specific players are locked to roles.
 */
export function assignRoles(
  playerIds: string[],
  roles: string[],
  spyCount: number = 1,
  moderatorAssignments: ModeratorPreAssignment[] = [],
): RoleAssignment[] {
  const result: RoleAssignment[] = [];
  const preAssignedIds = new Set(moderatorAssignments.map((ma) => ma.playerId));

  // Apply moderator pre-assignments first
  let remainingSpySlots = spyCount;
  for (const ma of moderatorAssignments) {
    const isSpy = ma.role === "SPY";
    if (isSpy) {remainingSpySlots--;}
    result.push({ playerId: ma.playerId, role: ma.role, isSpy });
  }

  // Remaining players need roles
  const unassigned = shuffle(playerIds.filter((id) => !preAssignedIds.has(id)));
  const availableRoles = shuffle(roles);

  let roleIndex = 0;
  for (const playerId of unassigned) {
    if (remainingSpySlots > 0) {
      result.push({ playerId, role: "SPY", isSpy: true });
      remainingSpySlots--;
    } else {
      const role = availableRoles[roleIndex % availableRoles.length];
      result.push({ playerId, role, isSpy: false });
      roleIndex++;
    }
  }

  return result;
}

// Audio beep for timer expiration (base64 WAV)
export const BEEP_AUDIO =
  "data:audio/wav;base64,UklGRl9vT19teleQQFMATWIBAAEAEQBRAAAiIQACABAAAGRhdGE/b09f";

// Re-export shared constants for backward compatibility
export { MIN_PLAYERS, MAX_PLAYERS, DEFAULT_TIME_LIMIT, MAX_ROLES_PER_LOCATION } from "@/shared/lib/constants";
// Re-export room code generator
export { generateRoomCode } from "@/shared/lib/room-code";
