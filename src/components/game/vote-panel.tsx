"use client";

import { useState } from "react";
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

export function VotePanel({ players, playerId, gameId }: VotePanelProps) {
  const [open, setOpen] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);

  async function handleVote(suspectId: string) {
    setVoting(true);
    try {
      const res = await fetch(`/api/games/${gameId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: playerId, suspectId }),
      });
      if (res.ok) {
        setVoted(true);
        setOpen(false);
      }
    } finally {
      setVoting(false);
    }
  }

  if (voted) {
    return (
      <p className="text-sm text-muted-foreground text-center py-2">
        Vote submitted. Waiting for others...
      </p>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" className="flex-1 gap-2" />}
      >
        <Hand className="h-4 w-4" />
        Vote
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Who is the Spy?</DialogTitle>
          <DialogDescription>Select a player you suspect is the spy.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {players
            .filter((p) => p.id !== playerId)
            .map((p) => (
              <Button
                key={p.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleVote(p.id)}
                disabled={voting}
              >
                {p.name}
              </Button>
            ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
