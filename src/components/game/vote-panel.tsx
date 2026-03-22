"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Hand } from "lucide-react";
import type { PlayerInfo } from "@/types/game";

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
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = useCallback(
    async (suspectId: string) => {
      setIsVoting(true);
      try {
        const res = await fetch(`/api/games/${gameId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voterId: playerId, suspectId }),
        });
        if (res.ok) {
          setHasVoted(true);
          setIsOpen(false);
        }
      } finally {
        setIsVoting(false);
      }
    },
    [gameId, playerId],
  );

  const onVote = useCallback(
    (suspectId: string) => { void handleVote(suspectId); },
    [handleVote],
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
            <VotePlayerButton key={p.id} player={p} isVoting={isVoting} onVote={onVote} />
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
