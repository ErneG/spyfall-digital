export type GamePhase = "LOBBY" | "PLAYING" | "VOTING" | "REVEAL" | "FINISHED";

export interface RoomConfig {
  timeLimit: number;
  spyCount: number;
  autoStartTimer: boolean;
  hideSpyCount: boolean;
  moderatorMode: boolean;
  moderatorLocationId: string | null;
}

export interface RoomState {
  id: string;
  code: string;
  state: GamePhase;
  hostId: string;
  timeLimit: number;
  spyCount: number;
  autoStartTimer: boolean;
  hideSpyCount: boolean;
  moderatorMode: boolean;
  moderatorLocationId: string | null;
  players: PlayerInfo[];
  selectedLocationCount: number;
  totalLocationCount: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isOnline: boolean;
  moderatorRole?: string | null;
}

export interface GameView {
  gameId: string;
  phase: GamePhase;
  myRole: string;
  isSpy: boolean;
  location: string | null; // null for spies
  locationImage?: string;
  allLocations: LocationInfo[]; // shown to all players to help discussion
  players: PlayerInfo[];
  timeRemaining: number;
  timeLimit: number;
  startedAt: string;
  timerRunning: boolean;
  hideSpyCount: boolean;
  spyCount: number;
  prevLocationName: string | null;
  // Only in REVEAL/FINISHED
  votes?: { voterId: string; suspectId: string }[];
  spies?: string[];
  revealedLocation?: string;
}

export interface LocationInfo {
  id: string;
  name: string;
  imageUrl?: string;
  edition?: number;
}

export interface VoteResult {
  suspectId: string;
  suspectName: string;
  votes: number;
  isSpy: boolean;
}

export interface CustomLocationData {
  id: string;
  name: string;
  allSpies: boolean;
  selected: boolean;
  roles: { id: string; name: string }[];
}

export const TIMER_PRESETS = [
  { label: "6:00", value: 360 },
  { label: "7:00", value: 420 },
  { label: "8:00", value: 480 },
  { label: "9:00", value: 540 },
  { label: "10:00", value: 600 },
] as const;
