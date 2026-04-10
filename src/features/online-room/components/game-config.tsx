"use client";

import { Settings } from "lucide-react";
import { memo } from "react";

import { useAuth } from "@/domains/auth/hooks";
import { useTranslation } from "@/shared/i18n/context";

import { ConfigToggles, GameConfigSummary, TimerSection } from "./game-config-parts";
import { SourceSection, SpySection } from "./game-config-sections";
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
  onOpenCollectionPicker: () => void;
  onOpenLocations: () => void;
}

export const GameConfig = memo(function GameConfig(props: GameConfigProps) {
  const { isAuthenticated } = useAuth();
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
      <p className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">
        <Settings className="mr-1 inline h-3 w-3" /> {t.config.gameSettings}
      </p>
      <TimerSection timeLimit={props.timeLimit} onSelect={handlers.handleTimeSelect} />
      <SpySection spyCount={props.spyCount} onSelect={handlers.handleSpySelect} />
      <SourceSection
        canImportCollections={isAuthenticated}
        selectedLocationCount={props.selectedLocationCount}
        totalLocationCount={props.totalLocationCount}
        onOpenBuiltIn={props.onOpenLocations}
        onOpenCollection={props.onOpenCollectionPicker}
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
