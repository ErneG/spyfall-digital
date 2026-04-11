import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { helpers, logic, prisma } = vi.hoisted(() => ({
  helpers: {
    buildCandidates: vi.fn(),
    calculateTimeRemaining: vi.fn(),
    fetchCombinedLocations: vi.fn(),
    pickLocation: vi.fn(),
    REVEAL_STATES: new Set(["REVEAL", "FINISHED"]),
  },
  logic: {
    assignRoles: vi.fn(),
    MIN_PLAYERS: 3,
  },
  prisma: {
    room: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    player: {
      updateMany: vi.fn(),
    },
    game: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    vote: {
      count: vi.fn(),
      upsert: vi.fn(),
    },
    location: {
      findUnique: vi.fn(),
    },
    customLocation: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

type GameTransactionClient = {
  game: {
    create: typeof prisma.game.create;
    update: typeof prisma.game.update;
  };
  room: {
    update: typeof prisma.room.update;
  };
  player: {
    updateMany: typeof prisma.player.updateMany;
  };
};

type GameTransactionInput =
  | ((client: GameTransactionClient) => Promise<unknown>)
  | Promise<unknown>[];

vi.mock("@/domains/game/actions", () => {
  throw new Error("entities/game/actions should not import @/domains/game/actions");
});

vi.mock("./action-helpers", () => helpers);
vi.mock("./logic", () => logic);

vi.mock("@/shared/lib/prisma", () => ({
  prisma,
}));

describe("game entity actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    prisma.$transaction.mockImplementation((input: GameTransactionInput) => {
      if (Array.isArray(input)) {
        return Promise.all(input);
      }

      return input({
        game: {
          create: prisma.game.create,
          update: prisma.game.update,
        },
        room: {
          update: prisma.room.update,
        },
        player: {
          updateMany: prisma.player.updateMany,
        },
      });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a game round through local helpers and assignments", async () => {
    prisma.room.findUnique = vi.fn().mockResolvedValue({
      id: "room-1",
      hostId: "player-1",
      moderatorMode: false,
      moderatorLocationId: null,
      prevLocationId: null,
      autoStartTimer: true,
      spyCount: 1,
      players: [
        { id: "player-1", moderatorRole: null },
        { id: "player-2", moderatorRole: null },
        { id: "player-3", moderatorRole: null },
      ],
      selectedLocations: [{ locationId: "loc-1" }],
      customLocations: [],
    });
    helpers.buildCandidates.mockResolvedValue([
      {
        type: "builtin",
        id: "loc-1",
        name: "Airplane",
        roles: ["Pilot", "Copilot"],
        isAllSpies: false,
      },
    ]);
    helpers.pickLocation.mockReturnValue({
      type: "builtin",
      id: "loc-1",
      name: "Airplane",
      roles: ["Pilot", "Copilot"],
      isAllSpies: false,
    });
    logic.assignRoles.mockReturnValue([
      { playerId: "player-1", role: "SPY", isSpy: true },
      { playerId: "player-2", role: "Pilot", isSpy: false },
      { playerId: "player-3", role: "Copilot", isSpy: false },
    ]);
    prisma.game.create.mockResolvedValue({
      id: "game-1",
      state: "PLAYING",
      startedAt: new Date("2026-04-11T12:00:00.000Z"),
      timerRunning: true,
    });
    prisma.room.update.mockResolvedValue({});
    prisma.player.updateMany.mockResolvedValue({});

    const gameActions = await import("./actions");
    const result = await gameActions.startGame({ roomId: "room-1", playerId: "player-1" });

    expect(result).toEqual({
      success: true,
      data: {
        gameId: "game-1",
        state: "PLAYING",
        startedAt: "2026-04-11T12:00:00.000Z",
        timerRunning: true,
      },
    });
    expect(helpers.buildCandidates).toHaveBeenCalledWith(["loc-1"], []);
    expect(helpers.pickLocation).toHaveBeenCalled();
    expect(logic.assignRoles).toHaveBeenCalledWith(
      ["player-1", "player-2", "player-3"],
      ["Pilot", "Copilot"],
      1,
      [],
    );
  });

  it("hydrates a player-specific game view", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T12:05:00.000Z"));

    prisma.game.findUnique.mockResolvedValue({
      id: "game-1",
      roomId: "room-1",
      state: "REVEAL",
      startedAt: new Date("2026-04-11T12:00:00.000Z"),
      timerRunning: true,
      timerPausedAt: null,
      locationName: "Airplane",
      assignments: [
        { playerId: "player-1", role: "SPY", isSpy: true },
        { playerId: "player-2", role: "Pilot", isSpy: false },
      ],
      room: {
        timeLimit: 480,
        hideSpyCount: true,
        spyCount: 1,
        prevLocationId: "loc-0",
        players: [{ id: "player-1", name: "Alice", isHost: true, isOnline: true }],
      },
      votes: [{ voterId: "player-1", suspectId: "player-2" }],
    });
    helpers.fetchCombinedLocations.mockResolvedValue([
      { id: "loc-1", name: "Airplane", imageUrl: null },
    ]);
    helpers.calculateTimeRemaining.mockReturnValue(300);
    prisma.location.findUnique.mockResolvedValue({ name: "Submarine" });

    const gameActions = await import("./actions");
    const result = await gameActions.getGameState("game-1", "player-1");

    expect(result).toEqual({
      success: true,
      data: {
        gameId: "game-1",
        phase: "REVEAL",
        myRole: "SPY",
        isSpy: true,
        location: null,
        allLocations: [{ id: "loc-1", name: "Airplane", imageUrl: null }],
        players: [{ id: "player-1", name: "Alice", isHost: true, isOnline: true }],
        timeRemaining: 300,
        timeLimit: 480,
        startedAt: "2026-04-11T12:00:00.000Z",
        timerRunning: true,
        hideSpyCount: true,
        spyCount: 1,
        prevLocationName: "Submarine",
        votes: [{ voterId: "player-1", suspectId: "player-2" }],
        spies: ["player-1"],
        revealedLocation: "Airplane",
      },
    });
  });

  it("casts a vote and moves the game into voting", async () => {
    prisma.game.findUnique.mockResolvedValue({
      id: "game-1",
      roomId: "room-1",
      state: "PLAYING",
      assignments: [],
      room: { players: [{ id: "player-1" }, { id: "player-2" }, { id: "player-3" }] },
      votes: [],
    });
    prisma.vote.upsert.mockResolvedValue({});
    prisma.vote.count.mockResolvedValue(1);
    prisma.game.update.mockResolvedValue({});
    prisma.room.update.mockResolvedValue({});

    const gameActions = await import("./actions");
    const result = await gameActions.castVote({
      gameId: "game-1",
      voterId: "player-1",
      suspectId: "player-2",
    });

    expect(result).toEqual({
      success: true,
      data: { success: true, votesIn: 1, totalPlayers: 3 },
    });
  });

  it("ends and restarts games through local persistence", async () => {
    prisma.game.findUnique
      .mockResolvedValueOnce({
        id: "game-1",
        state: "PLAYING",
        locationId: "loc-1",
        roomId: "room-1",
        room: { hostId: "player-1" },
        assignments: [{ playerId: "player-1", isSpy: false }],
      })
      .mockResolvedValueOnce({
        id: "game-1",
        roomId: "room-1",
        room: { hostId: "player-1" },
      });
    prisma.game.update.mockResolvedValue({});
    prisma.room.update.mockResolvedValue({});

    const gameActions = await import("./actions");

    await expect(gameActions.endGame({ gameId: "game-1", playerId: "player-1" })).resolves.toEqual({
      success: true,
      data: { ended: true },
    });
    await expect(
      gameActions.restartGame({ gameId: "game-1", playerId: "player-1" }),
    ).resolves.toEqual({
      success: true,
      data: { success: true },
    });
  });

  it("pauses the timer for a host-controlled game", async () => {
    prisma.game.findUnique.mockResolvedValue({
      id: "game-1",
      timerRunning: true,
      timerPausedAt: null,
      startedAt: new Date("2026-04-11T12:00:00.000Z"),
      room: { hostId: "player-1" },
    });
    prisma.game.update.mockResolvedValue({});

    const gameActions = await import("./actions");
    const result = await gameActions.toggleTimer({
      gameId: "game-1",
      playerId: "player-1",
      action: "pause",
    });

    expect(result).toEqual({
      success: true,
      data: { success: true, timerRunning: false },
    });
    const updateCall = prisma.game.update.mock.calls[0]?.[0] as {
      data: { timerRunning: boolean };
      where: { id: string };
    };
    expect(updateCall.where).toEqual({ id: "game-1" });
    expect(updateCall.data.timerRunning).toBe(false);
  });
});
