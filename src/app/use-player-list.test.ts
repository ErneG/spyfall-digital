import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePlayerList } from "./use-player-list";

describe("usePlayerList", () => {
  it("keeps existing entry ids when players are added", () => {
    const { result, rerender } = renderHook(
      ({ playerNames }) =>
        usePlayerList({
          playerNames,
          onPlayerNameChange: vi.fn(),
          onAddPlayer: vi.fn(),
          onRemovePlayer: vi.fn(),
          onReorderPlayers: vi.fn(),
        }),
      { initialProps: { playerNames: ["Alice", "Bob"] } },
    );

    const initialEntries = result.current.entries;

    rerender({ playerNames: ["Alice", "Bob", "Charlie"] });

    expect(result.current.entries).toHaveLength(3);
    expect(result.current.entries[0]?.id).toBe(initialEntries[0]?.id);
    expect(result.current.entries[1]?.id).toBe(initialEntries[1]?.id);
    expect(result.current.entries[2]?.id).toBeTruthy();
  });

  it("maps reordered ids back to the correct player indexes", () => {
    const onPlayerNameChange = vi.fn();
    const onRemovePlayer = vi.fn();
    const onReorderPlayers = vi.fn();

    const { result } = renderHook(() =>
      usePlayerList({
        playerNames: ["Alice", "Bob", "Charlie"],
        onPlayerNameChange,
        onAddPlayer: vi.fn(),
        onRemovePlayer,
        onReorderPlayers,
      }),
    );

    const [firstEntry, secondEntry, thirdEntry] = result.current.entries;
    expect(firstEntry).toBeDefined();
    expect(secondEntry).toBeDefined();
    expect(thirdEntry).toBeDefined();

    if (!firstEntry || !secondEntry || !thirdEntry) {
      throw new Error("Expected three player entries");
    }

    const reorderedEntries = [thirdEntry, firstEntry, secondEntry];

    act(() => {
      result.current.handleReorder(reorderedEntries);
    });

    expect(onReorderPlayers).toHaveBeenCalledWith(["Charlie", "Alice", "Bob"]);

    act(() => {
      result.current.handleNameChange(reorderedEntries[0].id, "Charlotte");
    });

    expect(onPlayerNameChange).toHaveBeenCalledWith(0, "Charlotte");

    act(() => {
      result.current.handleRemove(reorderedEntries[1].id);
    });

    expect(onRemovePlayer).toHaveBeenCalledWith(1);
  });
});
