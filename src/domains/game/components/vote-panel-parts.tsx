"use client";

import { memo, useCallback } from "react";

import type { PlayerInfo } from "@/shared/types/common";

export const VotePlayerButton = memo(function VotePlayerButton({
  player,
  isVoting,
  onVote,
}: {
  player: PlayerInfo;
  isVoting: boolean;
  onVote: (suspectId: string) => void;
}) {
  const handleClick = useCallback(() => {
    onVote(player.id);
  }, [onVote, player.id]);

  return (
    <button
      className="flex h-[56px] w-full items-center gap-3 rounded-2xl bg-[#141414] px-4 text-left transition-colors hover:bg-[#1C1C1E] disabled:opacity-50"
      onClick={handleClick}
      disabled={isVoting}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-[#8E8E93]">
        {player.name.charAt(0).toUpperCase()}
      </div>
      <span className="font-medium">{player.name}</span>
    </button>
  );
});
