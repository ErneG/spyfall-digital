export const LOCATION_CATEGORIES = [
  "Transportation",
  "Entertainment",
  "Nightlife & Events",
  "Food & Dining",
  "Government & Law",
  "Military & Combat",
  "Education & Science",
  "Healthcare",
  "Outdoors & Nature",
  "Workplace",
] as const;

export type LocationCategory = (typeof LOCATION_CATEGORIES)[number];
