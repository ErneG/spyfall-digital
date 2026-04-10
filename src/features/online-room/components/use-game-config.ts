import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { updateRoomConfig } from "@/entities/room/actions";
import { roomKeys } from "@/entities/room/query";
import { type RoomState } from "@/entities/room/state";

interface ConfigPatch {
  timeLimit?: number;
  spyCount?: number;
  autoStartTimer?: boolean;
  hideSpyCount?: boolean;
  moderatorMode?: boolean;
}

export function useGameConfig(roomCode: string, playerId: string) {
  const queryClient = useQueryClient();
  const cacheKey = roomKeys.state(roomCode);

  const configMutation = useMutation({
    mutationFn: (patch: ConfigPatch) => updateRoomConfig({ roomCode, playerId, ...patch }),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previous = queryClient.getQueryData<RoomState>(cacheKey);
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

  const handleTimeSelect = useCallback(
    (value: number) => {
      configMutation.mutate({ timeLimit: value });
    },
    [configMutation],
  );

  const handleSpySelect = useCallback(
    (count: number) => {
      configMutation.mutate({ spyCount: count });
    },
    [configMutation],
  );

  const handleAutoStart = useCallback(
    (checked: boolean) => {
      configMutation.mutate({ autoStartTimer: checked });
    },
    [configMutation],
  );

  const handleHideSpy = useCallback(
    (checked: boolean) => {
      configMutation.mutate({ hideSpyCount: checked });
    },
    [configMutation],
  );

  const handleModerator = useCallback(
    (checked: boolean) => {
      configMutation.mutate({ moderatorMode: checked });
    },
    [configMutation],
  );

  return {
    handleTimeSelect,
    handleSpySelect,
    handleAutoStart,
    handleHideSpy,
    handleModerator,
  };
}
