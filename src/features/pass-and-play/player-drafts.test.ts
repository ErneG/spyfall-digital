import { describe, expect, it } from "vitest";

import {
  addPlayerDraft,
  createInitialPlayerDrafts,
  removePlayerDraft,
  reorderPlayerDrafts,
  updatePlayerDraftName,
} from "./player-drafts";

describe("player draft helpers", () => {
  it("creates three stable drafts for the initial pass-and-play setup", () => {
    const drafts = createInitialPlayerDrafts();

    expect(drafts).toHaveLength(3);
    expect(new Set(drafts.map((draft) => draft.id)).size).toBe(3);
    expect(drafts.map((draft) => draft.name)).toEqual(["", "", ""]);
  });

  it("adds, updates, removes, and reorders drafts by stable id", () => {
    const initial = createInitialPlayerDrafts();
    const expanded = addPlayerDraft(initial);
    const renamed = updatePlayerDraftName(expanded, expanded[2].id, "Charlie");
    const reordered = reorderPlayerDrafts(renamed, [
      renamed[2],
      renamed[0],
      renamed[1],
      renamed[3],
    ]);
    const reduced = removePlayerDraft(reordered, reordered[1].id);

    expect(expanded).toHaveLength(4);
    expect(renamed[2]).toMatchObject({ id: expanded[2].id, name: "Charlie" });
    expect(reordered.map((draft) => draft.id)).toEqual([
      renamed[2].id,
      renamed[0].id,
      renamed[1].id,
      renamed[3].id,
    ]);
    expect(reduced.map((draft) => draft.id)).toEqual([renamed[2].id, renamed[1].id, renamed[3].id]);
    expect(reduced[0].name).toBe("Charlie");
  });
});
