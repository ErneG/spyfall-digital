import { describe, expect, it } from "vitest";

import { getPassAndPlayAutoStartRequest } from "./runtime";

describe("getPassAndPlayAutoStartRequest", () => {
  it("returns the next start payload for pass-and-play sessions back in the lobby", () => {
    expect(
      getPassAndPlayAutoStartRequest(
        {
          mode: "pass-and-play",
          isHost: true,
          playerId: "player-1",
          roomCode: "ABCDE",
          roomId: "room-1",
          resume: {
            players: [{ id: "player-1", name: "Alice" }],
            gameId: "game-1",
            gameStartedAt: "2026-04-11T10:00:00.000Z",
            timeLimit: 480,
            spyCount: 1,
            hideSpyCount: false,
          },
        },
        {
          state: "LOBBY",
          players: [],
          timeLimit: 480,
          spyCount: 1,
          autoStartTimer: false,
          hideSpyCount: false,
          moderatorMode: false,
          moderatorLocationId: null,
          selectedLocationCount: 10,
          totalLocationCount: 54,
          currentGameId: null,
          gameStartedAt: null,
          timerRunning: false,
        },
        false,
      ),
    ).toEqual({
      roomId: "room-1",
      playerId: "player-1",
    });
  });

  it("returns null when the room is still mid-round", () => {
    expect(
      getPassAndPlayAutoStartRequest(
        {
          mode: "pass-and-play",
          isHost: true,
          playerId: "player-1",
          roomCode: "ABCDE",
          roomId: "room-1",
          resume: {
            players: [{ id: "player-1", name: "Alice" }],
            gameId: "game-1",
            gameStartedAt: "2026-04-11T10:00:00.000Z",
            timeLimit: 480,
            spyCount: 1,
            hideSpyCount: false,
          },
        },
        {
          state: "PLAYING",
          players: [],
          timeLimit: 480,
          spyCount: 1,
          autoStartTimer: false,
          hideSpyCount: false,
          moderatorMode: false,
          moderatorLocationId: null,
          selectedLocationCount: 10,
          totalLocationCount: 54,
          currentGameId: "game-1",
          gameStartedAt: "2026-04-11T10:00:00.000Z",
          timerRunning: true,
        },
        false,
      ),
    ).toBeNull();
  });

  it("returns null when auto-start is already in flight", () => {
    expect(
      getPassAndPlayAutoStartRequest(
        {
          mode: "pass-and-play",
          isHost: true,
          playerId: "player-1",
          roomCode: "ABCDE",
          roomId: "room-1",
          resume: {
            players: [{ id: "player-1", name: "Alice" }],
            gameId: "game-1",
            gameStartedAt: "2026-04-11T10:00:00.000Z",
            timeLimit: 480,
            spyCount: 1,
            hideSpyCount: false,
          },
        },
        {
          state: "LOBBY",
          players: [],
          timeLimit: 480,
          spyCount: 1,
          autoStartTimer: false,
          hideSpyCount: false,
          moderatorMode: false,
          moderatorLocationId: null,
          selectedLocationCount: 10,
          totalLocationCount: 54,
          currentGameId: null,
          gameStartedAt: null,
          timerRunning: false,
        },
        true,
      ),
    ).toBeNull();
  });

  it("returns null for online rooms", () => {
    expect(
      getPassAndPlayAutoStartRequest(
        {
          mode: "online",
          isHost: true,
          playerId: "player-1",
          roomCode: "ABCDE",
          roomId: "room-1",
        },
        {
          state: "LOBBY",
          players: [],
          timeLimit: 480,
          spyCount: 1,
          autoStartTimer: false,
          hideSpyCount: false,
          moderatorMode: false,
          moderatorLocationId: null,
          selectedLocationCount: 10,
          totalLocationCount: 54,
          currentGameId: null,
          gameStartedAt: null,
          timerRunning: false,
        },
        false,
      ),
    ).toBeNull();
  });
});
