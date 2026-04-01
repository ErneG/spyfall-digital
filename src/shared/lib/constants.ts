/** Game constraints — shared across domains */
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;
export const DEFAULT_TIME_LIMIT = 480;
export const MAX_ROLES_PER_LOCATION = 10;

/** Phases that show the reveal/results UI */
export const REVEAL_PHASES = new Set(["REVEAL", "FINISHED"]);

/** SSE polling interval in milliseconds */
export const SSE_POLL_INTERVAL = 1500;

/** Game state polling interval in milliseconds */
export const GAME_POLL_INTERVAL = 5000;

/** SSE heartbeat interval in milliseconds */
export const SSE_HEARTBEAT_INTERVAL = 15_000;
