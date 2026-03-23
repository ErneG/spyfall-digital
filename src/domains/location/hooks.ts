"use client";

import type { LocationsResponse } from "@/domains/location/schema";

export const locationKeys = {
  all: ["locations"] as const,
  forRoom: (roomCode: string) => ["locations", roomCode] as const,
} as const;

export async function fetchLocations(roomCode: string): Promise<LocationsResponse | null> {
  const res = await fetch(`/api/rooms/${roomCode}/locations`);
  if (!res.ok) return null;
  return (await res.json()) as LocationsResponse;
}
