"use client";

import { Settings } from "lucide-react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";

import { ConfigToggles, GameConfigSummary, TimerSection } from "./game-config-parts";
import { LocationSection, SpySection } from "./game-config-sections";
import { useGameConfig } from "./use-game-config";

export interface GameConfigProps {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  timeLimit: number;
  spyCount: number;
  autoStartTimer: boolean;
  hideSpyCount: boolean;
  moderatorMode: boolean;
  selectedLocationCount: number;
  totalLocationCount: number;
  onOpenLocations: () => void;
}

export const GameConfig = memo(function GameConfig(props: GameConfigProps) {
  const { t } = useTranslation();
  const handlers = useGameConfig(props.roomCode, props.playerId);

  if (!props.isHost) {
    return (
      <GameConfigSummary
        timeLimit={props.timeLimit}
        spyCount={props.spyCount}
        selectedLocationCount={props.selectedLocationCount}
        totalLocationCount={props.totalLocationCount}
        moderatorMode={props.moderatorMode}
      />
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-muted-foreground/60 text-[11px] tracking-[0.08em] uppercase">
        <Settings className="mr-1 inline h-3 w-3" /> {t.config.gameSettings}
      </p>
      <TimerSection timeLimit={props.timeLimit} onSelect={handlers.handleTimeSelect} />
      <SpySection spyCount={props.spyCount} onSelect={handlers.handleSpySelect} />
      <LocationSection
        selectedLocationCount={props.selectedLocationCount}
        totalLocationCount={props.totalLocationCount}
        onOpenLocations={props.onOpenLocations}
      />
      <ConfigToggles
        autoStartTimer={props.autoStartTimer}
        hideSpyCount={props.hideSpyCount}
        moderatorMode={props.moderatorMode}
        onAutoStart={handlers.handleAutoStart}
        onHideSpy={handlers.handleHideSpy}
        onModerator={handlers.handleModerator}
      />
    </div>
  );
});
