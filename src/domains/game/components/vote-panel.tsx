"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Hand } from "lucide-react";
import type { PlayerInfo } from "@/shared/types/common";
import { castVote } from "@/domains/game/actions";
import { gameKeys } from "@/domains/game/hooks";
import { unwrapAction } from "@/shared/lib/unwrap-action";

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
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleClick}
      disabled={isVoting}
    >
      {player.name}
    </Button>
  );
});

export const VotePanel = memo(function VotePanel({ players, playerId, gameId }: VotePanelProps) {
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
    (suspectId: string) => { voteMutation.mutate(suspectId); },
    [voteMutation],
  );

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const triggerElement = useMemo(
    () => <Button variant="outline" className="flex-1 gap-2" />,
    [],
  );

  const otherPlayers = useMemo(
    () => players.filter((p) => p.id !== playerId),
    [players, playerId],
  );

  if (hasVoted) {
    return (
      <p className="text-sm text-muted-foreground text-center py-2 flex-1">
        Vote submitted. Waiting for others...
      </p>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={triggerElement}>
        <Hand className="h-4 w-4" />
        Vote
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Who is the Spy?</DialogTitle>
          <DialogDescription>Select a player you suspect is the spy.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {otherPlayers.map((p) => (
            <VotePlayerButton key={p.id} player={p} isVoting={voteMutation.isPending} onVote={onVote} />
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
