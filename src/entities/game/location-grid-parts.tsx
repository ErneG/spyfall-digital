"use client";

import { memo, useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import type { LocationInfo } from "./schema";

export const LocationButton = memo(function LocationButton({
  location,
  isRevealed,
  isPrevious,
  isCrossed,
  isSpy,
  onSpyClick,
  onCrossClick,
}: {
  location: LocationInfo;
  isRevealed: boolean;
  isPrevious: boolean;
  isCrossed: boolean;
  isSpy: boolean;
  onSpyClick: (location: LocationInfo) => void;
  onCrossClick: (locationId: string) => void;
}) {
  const { translateLocation } = useTranslation();
  const handleClick = useCallback(() => {
    if (isSpy) {
      onSpyClick(location);
    } else {
      onCrossClick(location.id);
    }
  }, [isSpy, location, onCrossClick, onSpyClick]);

  let className = "cursor-pointer rounded-xl px-3 py-2 text-left text-xs transition-colors ";
  if (isRevealed) {
    className += "bg-spy-ink/12 text-spy-ink font-bold";
  } else if (isPrevious) {
    className += "bg-surface-2 text-muted-foreground/60 line-through opacity-50";
  } else if (isCrossed) {
    className += "bg-surface-2 text-muted-foreground/60 line-through";
  } else {
    className += "bg-surface-2 text-muted-foreground hover:bg-surface-3";
  }

  return (
    <button onClick={handleClick} className={className}>
      {translateLocation(location.name)}
    </button>
  );
});

export const GuessDialog = memo(function GuessDialog({
  guessTarget,
  isGuessing,
  onCancel,
  onConfirm,
}: {
  guessTarget: LocationInfo | null;
  isGuessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t, translateLocation } = useTranslation();

  return (
    <Dialog open={!!guessTarget} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.locationGrid.guessTitle}</DialogTitle>
          <DialogDescription>
            Are you sure the location is{" "}
            <strong>{guessTarget ? translateLocation(guessTarget.name) : ""}</strong>?
            {t.locationGrid.guessConfirm}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isGuessing}>
            {isGuessing ? t.locationGrid.guessing : t.locationGrid.confirmGuess}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
