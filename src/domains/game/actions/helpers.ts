import { shuffle } from "@/domains/game/logic";
import { prisma } from "@/shared/lib/prisma";

// ─── Helpers ────────────────────────────────────────────────

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
    ...customLocations.map((cl) => ({ id: cl.id, name: cl.name, imageUrl: null })),
  ].sort((a, b) => a.name.localeCompare(b.name));
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
      roles: location.roles.map((r) => r.name),
      isAllSpies: false,
    })),
    ...customLocations.map((cl) => ({
      type: "custom" as const,
      id: cl.id,
      name: cl.allSpies ? "?????" : cl.name,
      roles: cl.roles.map((r) => r.name),
      isAllSpies: cl.allSpies,
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
    const moderatorChoice = candidates.find((c) => c.id === moderatorLocationId);
    return moderatorChoice ?? shuffle(candidates)[0];
  }

  const filtered =
    candidates.length > 1 && previousLocationId
      ? candidates.filter((c) => c.id !== previousLocationId)
      : candidates;

  return shuffle(filtered)[0];
}
