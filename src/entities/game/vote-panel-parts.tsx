"use client";

import { ChevronRight } from "lucide-react";
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
      className="bg-surface-1 hover:bg-surface-2 flex h-[72px] w-full items-center gap-3 rounded-2xl px-4 text-left transition-colors disabled:opacity-50"
      onClick={handleClick}
      disabled={isVoting}
    >
      <div className="text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm font-semibold">
        {player.name.charAt(0).toUpperCase()}
      </div>
      <span className="flex-1 font-medium">{player.name}</span>
      <ChevronRight className="text-muted-foreground/60 h-4 w-4" />
    </button>
  );
});
