import { shuffle } from "@/entities/game/logic";
import { prisma } from "@/shared/lib/prisma";

export function calculateTimeRemaining(
  isTimerRunning: boolean,
  timerPausedAt: Date | null,
  startedAt: Date,
  timeLimit: number,
): number {
  if (!isTimerRunning && timerPausedAt) {
    const elapsedBeforePause = Math.floor((timerPausedAt.getTime() - startedAt.getTime()) / 1000);
    return Math.max(0, timeLimit - elapsedBeforePause);
  }

  const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  return Math.max(0, timeLimit - elapsed);
}

export async function fetchCombinedLocations(roomId: string) {
  const [allLocations, customLocations] = await Promise.all([
    prisma.location.findMany({
      select: { id: true, name: true, imageUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.customLocation.findMany({
      where: { roomId, selected: true, allSpies: false },
      select: { id: true, name: true },
    }),
  ]);

  return [
    ...allLocations,
    ...customLocations.map((location) => ({
      id: location.id,
      name: location.name,
      imageUrl: null,
    })),
  ].sort((left, right) => left.name.localeCompare(right.name));
}

export const REVEAL_STATES = new Set(["REVEAL", "FINISHED"]);

export type LocationCandidate = {
  type: "builtin" | "custom";
  id: string | null;
  name: string;
  roles: string[];
  isAllSpies: boolean;
};

export async function buildCandidates(
  selectedLocationIds: string[],
  customLocations: Array<{
    id: string;
    name: string;
    allSpies: boolean;
    roles: Array<{ name: string }>;
  }>,
): Promise<LocationCandidate[]> {
  const builtInLocations =
    selectedLocationIds.length > 0
      ? await prisma.location.findMany({
          where: { id: { in: selectedLocationIds } },
          include: { roles: true },
        })
      : [];

  return [
    ...builtInLocations.map((location) => ({
      type: "builtin" as const,
      id: location.id,
      name: location.name,
      roles: location.roles.map((role) => role.name),
      isAllSpies: false,
    })),
    ...customLocations.map((location) => ({
      type: "custom" as const,
      id: location.id,
      name: location.allSpies ? "?????" : location.name,
      roles: location.roles.map((role) => role.name),
      isAllSpies: location.allSpies,
    })),
  ];
}

export function pickLocation(
  candidates: LocationCandidate[],
  isModeratorMode: boolean,
  moderatorLocationId: string | null,
  previousLocationId: string | null,
): LocationCandidate {
  if (isModeratorMode && moderatorLocationId) {
    const moderatorChoice = candidates.find((candidate) => candidate.id === moderatorLocationId);
    return moderatorChoice ?? shuffle(candidates)[0];
  }

  const filteredCandidates =
    candidates.length > 1 && previousLocationId
      ? candidates.filter((candidate) => candidate.id !== previousLocationId)
      : candidates;

  return shuffle(filteredCandidates)[0];
}
