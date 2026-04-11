export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]];
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
  role: string;
}

export function assignRoles(
  playerIds: string[],
  roles: string[],
  spyCount: number = 1,
  moderatorAssignments: ModeratorPreAssignment[] = [],
): RoleAssignment[] {
  const assignments: RoleAssignment[] = [];
  const preAssignedIds = new Set(moderatorAssignments.map((assignment) => assignment.playerId));

  let remainingSpySlots = spyCount;
  for (const assignment of moderatorAssignments) {
    const isSpy = assignment.role === "SPY";
    if (isSpy) {
      remainingSpySlots -= 1;
    }
    assignments.push({ playerId: assignment.playerId, role: assignment.role, isSpy });
  }

  const unassignedPlayers = shuffle(playerIds.filter((id) => !preAssignedIds.has(id)));
  const availableRoles = shuffle(roles);

  let roleIndex = 0;
  for (const playerId of unassignedPlayers) {
    if (remainingSpySlots > 0) {
      assignments.push({ playerId, role: "SPY", isSpy: true });
      remainingSpySlots -= 1;
      continue;
    }

    const role = availableRoles[roleIndex % availableRoles.length];
    assignments.push({ playerId, role, isSpy: false });
    roleIndex += 1;
  }

  return assignments;
}

export {
  DEFAULT_TIME_LIMIT,
  MAX_PLAYERS,
  MAX_ROLES_PER_LOCATION,
  MIN_PLAYERS,
} from "@/shared/lib/constants";
export { generateRoomCode } from "@/shared/lib/room-code";
