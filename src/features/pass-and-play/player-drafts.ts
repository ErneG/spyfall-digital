export interface PlayerDraft {
  id: string;
  name: string;
}

const INITIAL_PLAYER_COUNT = 3;

function createPlayerDraft(id: number): PlayerDraft {
  return {
    id: `player-${String(id)}`,
    name: "",
  };
}

export function createInitialPlayerDrafts(): PlayerDraft[] {
  return Array.from({ length: INITIAL_PLAYER_COUNT }, (_, index) => createPlayerDraft(index));
}

export function addPlayerDraft(drafts: PlayerDraft[]): PlayerDraft[] {
  return [...drafts, createPlayerDraft(drafts.length)];
}

export function updatePlayerDraftName(
  drafts: PlayerDraft[],
  draftId: string,
  nextName: string,
): PlayerDraft[] {
  return drafts.map((draft) => (draft.id === draftId ? { ...draft, name: nextName } : draft));
}

export function removePlayerDraft(drafts: PlayerDraft[], draftId: string): PlayerDraft[] {
  return drafts.filter((draft) => draft.id !== draftId);
}

export function reorderPlayerDrafts(
  drafts: PlayerDraft[],
  reorderedDrafts: PlayerDraft[],
): PlayerDraft[] {
  const draftMap = new Map(drafts.map((draft) => [draft.id, draft]));

  return reorderedDrafts.map((draft) => draftMap.get(draft.id) ?? draft);
}
