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

import { VotePlayerButton } from "./vote-panel-parts";

import type { PlayerInfo } from "@/shared/types/common";

interface VotePanelProps {
  players: PlayerInfo[];
  playerId: string;
  gameId: string;
}

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

  const onVote = useCallback((suspectId: string) => voteMutation.mutate(suspectId), [voteMutation]);
  const handleCancel = useCallback(() => setIsOpen(false), []);

  const triggerElement = useMemo(
    () => (
      <Button className="h-[52px] flex-1 gap-2 rounded-2xl bg-white font-semibold text-black hover:bg-white/90" />
    ),
    [],
  );
  const otherPlayers = useMemo(() => players.filter((p) => p.id !== playerId), [players, playerId]);

  if (hasVoted) {
    return (
      <p className="text-success flex-1 py-2 text-center text-[13px]">{t.voting.voteSubmitted}</p>
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
          <Button variant="ghost" onClick={handleCancel} className="text-muted-foreground">
            {t.voting.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
