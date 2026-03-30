"use client";

import type { LocationsResponse } from "@/domains/location/schema";
import { getLocations } from "@/domains/location/actions";

export const locationKeys = {
  all: ["locations"] as const,
  forRoom: (roomCode: string) => ["locations", roomCode] as const,
} as const;

export async function fetchLocations(roomCode: string): Promise<LocationsResponse | null> {
  const result = await getLocations(roomCode);
  if (!result.success) return null;
  return result.data;
}
