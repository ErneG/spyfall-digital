"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TIMER_PRESETS } from "@/types/game";
import { Settings, Clock, Eye, EyeOff, Shield, Timer } from "lucide-react";

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

export function GameConfig({
  roomCode,
  playerId,
  isHost,
  timeLimit,
  spyCount,
  autoStartTimer,
  hideSpyCount,
  moderatorMode,
  selectedLocationCount,
  totalLocationCount,
  onOpenLocations,
}: GameConfigProps) {
  const updateConfig = useCallback(
    async (patch: Record<string, unknown>) => {
      await fetch(`/api/rooms/${roomCode}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, ...patch }),
      });
    },
    [roomCode, playerId],
  );

  if (!isHost) {
    // Non-host players see a read-only summary
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
              {Math.floor(timeLimit / 60)}:{String(timeLimit % 60).padStart(2, "0")}
            </Badge>
            <Badge variant="secondary">
              {spyCount} {spyCount === 1 ? "spy" : "spies"}
            </Badge>
            <Badge variant="secondary">
              {selectedLocationCount}/{totalLocationCount} locations
            </Badge>
            {moderatorMode && (
              <Badge variant="outline">
                <Shield className="mr-1 h-3 w-3" /> Moderator
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" /> Game Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Timer Presets */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" /> Timer
          </Label>
          <div className="flex gap-1.5">
            {TIMER_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => void updateConfig({ timeLimit: preset.value })}
                className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                  timeLimit === preset.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spy Count */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Spies</Label>
          <div className="flex gap-1.5">
            {[1, 2].map((count) => (
              <button
                key={count}
                onClick={() => void updateConfig({ spyCount: count })}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  spyCount === count
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {count} {count === 1 ? "Spy" : "Spies"}
              </button>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Locations</Label>
          <button
            onClick={onOpenLocations}
            className="w-full rounded-md bg-muted px-3 py-2 text-left text-sm hover:bg-muted/80 transition-colors"
          >
            {selectedLocationCount} of {totalLocationCount} locations selected
            <span className="float-right text-muted-foreground">Edit &rarr;</span>
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-start" className="flex items-center gap-1.5 text-sm">
              <Timer className="h-3 w-3" /> Auto-start timer
            </Label>
            <Switch
              id="auto-start"
              checked={autoStartTimer}
              onCheckedChange={(checked) => void updateConfig({ autoStartTimer: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="hide-spy" className="flex items-center gap-1.5 text-sm">
              {hideSpyCount ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              Hide spy count
            </Label>
            <Switch
              id="hide-spy"
              checked={hideSpyCount}
              onCheckedChange={(checked) => void updateConfig({ hideSpyCount: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="moderator" className="flex items-center gap-1.5 text-sm">
              <Shield className="h-3 w-3" /> Moderator mode
            </Label>
            <Switch
              id="moderator"
              checked={moderatorMode}
              onCheckedChange={(checked) => void updateConfig({ moderatorMode: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
