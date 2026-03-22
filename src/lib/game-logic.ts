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

// Room code generation (5-char alphanumeric, uppercase)
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

// Shuffle array (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface RoleAssignment {
  playerId: string;
  role: string;
  isSpy: boolean;
}

/**
 * Assign roles to players for a game round.
 * - `spyCount` players become spies
 * - Remaining players get shuffled roles from the location's role pool
 */
export function assignRoles(
  playerIds: string[],
  roles: string[],
  spyCount: number = 1,
): RoleAssignment[] {
  const shuffledPlayers = shuffle(playerIds);
  const shuffledRoles = shuffle(roles);

  return shuffledPlayers.map((playerId, index) => {
    if (index < spyCount) {
      return { playerId, role: "SPY", isSpy: true };
    }
    // Cycle through available roles if more players than roles
    const roleIndex = (index - spyCount) % shuffledRoles.length;
    return { playerId, role: shuffledRoles[roleIndex], isSpy: false };
  });
}

// Game constraints (matching the reference project)
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;
export const DEFAULT_TIME_LIMIT = 480; // 8 minutes in seconds
export const MAX_ROLES_PER_LOCATION = 10;
