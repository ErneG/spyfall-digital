"use client";

import { memo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { TIMER_PRESETS, type RoomEvent } from "@/domains/room/schema";
import { updateRoomConfig } from "@/domains/room/actions";
import { roomKeys } from "@/domains/room/hooks";
import { Settings, Clock, Eye, EyeOff, Shield, Timer } from "lucide-react";

const SECONDS_PER_MINUTE = 60;
const SPY_OPTIONS = [1, 2] as const;

interface GameConfigProps {
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

interface ConfigPatch {
  timeLimit?: number;
  spyCount?: number;
  autoStartTimer?: boolean;
  hideSpyCount?: boolean;
  moderatorMode?: boolean;
}

/* -- Sub-components ----------------------------------------- */

const GameConfigSummary = memo(function GameConfigSummary({
  timeLimit, spyCount, selectedLocationCount, totalLocationCount, moderatorMode,
}: Pick<GameConfigProps, "timeLimit" | "spyCount" | "selectedLocationCount" | "totalLocationCount" | "moderatorMode">) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          <Settings className="h-4 w-4" /> Game Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {Math.floor(timeLimit / SECONDS_PER_MINUTE)}:{String(timeLimit % SECONDS_PER_MINUTE).padStart(2, "0")}
          </Badge>
          <Badge variant="secondary">{spyCount} {spyCount === 1 ? "spy" : "spies"}</Badge>
          <Badge variant="secondary">{selectedLocationCount}/{totalLocationCount} locations</Badge>
          {moderatorMode && <Badge variant="outline"><Shield className="mr-1 h-3 w-3" /> Moderator</Badge>}
        </div>
      </CardContent>
    </Card>
  );
});

const PresetButton = memo(function PresetButton({
  label, value, isSelected, onClick,
}: {
  label: string; value: number; isSelected: boolean; onClick: (value: number) => void;
}) {
  const handleClick = useCallback(() => { onClick(value); }, [onClick, value]);
  return (
    <button
      onClick={handleClick}
      className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
        isSelected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
      }`}
    >
      {label}
    </button>
  );
});

const ConfigToggles = memo(function ConfigToggles({
  autoStartTimer, hideSpyCount, moderatorMode,
  onAutoStart, onHideSpy, onModerator,
}: {
  autoStartTimer: boolean; hideSpyCount: boolean; moderatorMode: boolean;
  onAutoStart: (checked: boolean) => void; onHideSpy: (checked: boolean) => void; onModerator: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-start" className="flex items-center gap-1.5 text-sm">
          <Timer className="h-3 w-3" /> Auto-start timer
        </Label>
        <Switch id="auto-start" checked={autoStartTimer} onCheckedChange={onAutoStart} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="hide-spy" className="flex items-center gap-1.5 text-sm">
          {hideSpyCount ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          Hide spy count
        </Label>
        <Switch id="hide-spy" checked={hideSpyCount} onCheckedChange={onHideSpy} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="moderator" className="flex items-center gap-1.5 text-sm">
          <Shield className="h-3 w-3" /> Moderator mode
        </Label>
        <Switch id="moderator" checked={moderatorMode} onCheckedChange={onModerator} />
      </div>
    </div>
  );
});

/* -- Main component ----------------------------------------- */

export const GameConfig = memo(function GameConfig({
  roomCode, playerId, isHost, timeLimit, spyCount, autoStartTimer,
  hideSpyCount, moderatorMode, selectedLocationCount, totalLocationCount, onOpenLocations,
}: GameConfigProps) {
  const queryClient = useQueryClient();
  const cacheKey = roomKeys.events(roomCode);

  const configMutation = useMutation({
    mutationFn: (patch: ConfigPatch) =>
      updateRoomConfig({ roomCode, playerId, ...patch }),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previous = queryClient.getQueryData<RoomEvent>(cacheKey);
      if (previous) {
        queryClient.setQueryData(cacheKey, { ...previous, ...patch });
      }
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(cacheKey, context.previous);
      }
    },
  });

  const handleTimeSelect = useCallback((value: number) => { configMutation.mutate({ timeLimit: value }); }, [configMutation]);
  const handleSpySelect = useCallback((count: number) => { configMutation.mutate({ spyCount: count }); }, [configMutation]);
  const handleAutoStart = useCallback((checked: boolean) => { configMutation.mutate({ autoStartTimer: checked }); }, [configMutation]);
  const handleHideSpy = useCallback((checked: boolean) => { configMutation.mutate({ hideSpyCount: checked }); }, [configMutation]);
  const handleModerator = useCallback((checked: boolean) => { configMutation.mutate({ moderatorMode: checked }); }, [configMutation]);

  if (!isHost) {
    return <GameConfigSummary timeLimit={timeLimit} spyCount={spyCount} selectedLocationCount={selectedLocationCount} totalLocationCount={totalLocationCount} moderatorMode={moderatorMode} />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Settings className="h-4 w-4" /> Game Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3 w-3" /> Timer</Label>
          <div className="flex gap-1.5">
            {TIMER_PRESETS.map((preset) => (
              <PresetButton key={preset.value} label={preset.label} value={preset.value} isSelected={timeLimit === preset.value} onClick={handleTimeSelect} />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Spies</Label>
          <div className="flex gap-1.5">
            {SPY_OPTIONS.map((count) => (
              <PresetButton key={count} label={`${count} ${count === 1 ? "Spy" : "Spies"}`} value={count} isSelected={spyCount === count} onClick={handleSpySelect} />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Locations</Label>
          <button onClick={onOpenLocations} className="w-full rounded-md bg-muted px-3 py-2 text-left text-sm hover:bg-muted/80 transition-colors">
            {selectedLocationCount} of {totalLocationCount} locations selected
            <span className="float-right text-muted-foreground">Edit &rarr;</span>
          </button>
        </div>
        <ConfigToggles autoStartTimer={autoStartTimer} hideSpyCount={hideSpyCount} moderatorMode={moderatorMode} onAutoStart={handleAutoStart} onHideSpy={handleHideSpy} onModerator={handleModerator} />
      </CardContent>
    </Card>
  );
});
