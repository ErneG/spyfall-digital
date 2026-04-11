import { beforeEach, describe, expect, it, vi } from "vitest";

const applyRoomContentSource = vi.fn();
const createPassAndPlayRoom = vi.fn();
const createRoom = vi.fn();
const getRoomState = vi.fn();
const joinRoom = vi.fn();
const updateRoomConfig = vi.fn();

vi.mock("@/domains/room/actions", () => ({
  applyRoomContentSource,
  createPassAndPlayRoom,
  createRoom,
  getRoomState,
  joinRoom,
  updateRoomConfig,
}));

describe("room entity actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("delegates room server actions through the entity layer", async () => {
    applyRoomContentSource.mockResolvedValue({ success: true, data: { sourceKind: "built-in" } });
    createPassAndPlayRoom.mockResolvedValue({ success: true, data: { roomId: "room-pp" } });
    createRoom.mockResolvedValue({ success: true, data: { roomId: "room-1" } });
    getRoomState.mockResolvedValue({ success: true, data: { code: "ABCDE" } });
    joinRoom.mockResolvedValue({ success: true, data: { playerId: "player-1" } });
    updateRoomConfig.mockResolvedValue({ success: true, data: { timeLimit: 480 } });

    const roomActions = await import("./actions");

    await expect(
      roomActions.applyRoomContentSource({
        roomCode: "ABCDE",
        playerId: "player-1",
        source: { kind: "built-in", categories: ["Transportation"] },
      }),
    ).resolves.toEqual({ success: true, data: { sourceKind: "built-in" } });
    await expect(
      roomActions.createPassAndPlayRoom({
        players: { names: ["Alice", "Bob", "Charlie"] },
        settings: { timeLimit: 480, spyCount: 1, hideSpyCount: false },
        source: { kind: "built-in", categories: ["Transportation"] },
      }),
    ).resolves.toEqual({ success: true, data: { roomId: "room-pp" } });
    await expect(
      roomActions.createRoom({ hostName: "Alice", timeLimit: 480, spyCount: 1 }),
    ).resolves.toEqual({ success: true, data: { roomId: "room-1" } });
    await expect(roomActions.getRoomState({ roomCode: "ABCDE" })).resolves.toEqual({
      success: true,
      data: { code: "ABCDE" },
    });
    await expect(roomActions.joinRoom({ roomCode: "ABCDE", playerName: "Bob" })).resolves.toEqual({
      success: true,
      data: { playerId: "player-1" },
    });
    await expect(
      roomActions.updateRoomConfig({ roomCode: "ABCDE", playerId: "player-1", timeLimit: 480 }),
    ).resolves.toEqual({ success: true, data: { timeLimit: 480 } });
  });
});
