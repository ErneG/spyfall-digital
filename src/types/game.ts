export type GamePhase = "LOBBY" | "PLAYING" | "VOTING" | "REVEAL" | "FINISHED";

export interface RoomState {
  id: string;
  code: string;
  state: GamePhase;
  hostId: string;
  timeLimit: number;
  spyCount: number;
  players: PlayerInfo[];
}

export interface PlayerInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isOnline: boolean;
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
}

export interface LocationInfo {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface VoteResult {
  suspectId: string;
  suspectName: string;
  votes: number;
  isSpy: boolean;
}
