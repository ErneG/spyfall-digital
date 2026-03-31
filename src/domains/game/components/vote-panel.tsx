"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Hand } from "lucide-react";
import { memo, useState, useCallback, useMemo } from "react";


import { castVote } from "@/domains/game/actions";
import { gameKeys } from "@/domains/game/hooks";
import { useTranslation } from "@/shared/i18n/context";
import { unwrapAction } from "@/shared/lib/unwrap-action";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import type { PlayerInfo } from "@/shared/types/common";

interface VotePanelProps {
  players: PlayerInfo[];
  playerId: string;
  gameId: string;
}

const VotePlayerButton = memo(function VotePlayerButton({
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

export const VotePanel = memo(function VotePanel({ players, playerId, gameId }: VotePanelProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: (suspectId: string) =>
      castVote({ gameId, voterId: playerId, suspectId }).then(unwrapAction),
    onSuccess: () => {
      setHasVoted(true);
      setIsOpen(false);
      void queryClient.invalidateQueries({ queryKey: gameKeys.state(gameId, playerId) });
    },
  });

  const onVote = useCallback(
    (suspectId: string) => {
      voteMutation.mutate(suspectId);
    },
    [voteMutation],
  );

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const triggerElement = useMemo(
    () => (
      <Button className="h-[52px] flex-1 gap-2 rounded-2xl bg-white font-semibold text-black hover:bg-white/90" />
    ),
    [],
  );

  const otherPlayers = useMemo(() => players.filter((p) => p.id !== playerId), [players, playerId]);

  if (hasVoted) {
    return (
      <p className="flex-1 py-2 text-center text-[13px] text-[#34D399]">{t.voting.voteSubmitted}</p>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={triggerElement}>
        <Hand className="h-4 w-4" />
        {t.game.vote}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.voting.whoIsSpy}</DialogTitle>
          <DialogDescription>{t.voting.selectSuspect}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {otherPlayers.map((p) => (
            <VotePlayerButton
              key={p.id}
              player={p}
              isVoting={voteMutation.isPending}
              onVote={onVote}
            />
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel} className="text-[#8E8E93]">
            {t.voting.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
