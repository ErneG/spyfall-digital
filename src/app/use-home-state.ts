"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState, useEffect } from "react";

import { startGame } from "@/domains/game/actions";
import { createRoom, joinRoom, createPassAndPlayRoom } from "@/domains/room/actions";
import { useSession } from "@/shared/hooks/use-session";
import { DEFAULT_TIME_LIMIT } from "@/shared/lib/constants";
import { unwrapAction } from "@/shared/lib/unwrap-action";

import { useInputHandlers, useConfigHandlers, useActionHandlers } from "./use-home-handlers";

/* ── Types ──────────────────────────────────────────── */

interface MutationParams {
  setSession: ReturnType<typeof useSession>["setSession"];
  router: ReturnType<typeof useRouter>;
  setError: Dispatch<SetStateAction<string>>;
  pnpTimeLimit: number;
  pnpSpyCount: number;
  shouldPnpHideSpyCount: boolean;
  pnpEditions: Array<1 | 2>;
}

export type HomeStateMutations = ReturnType<typeof useMutations>;

/* ── Internal: mutation wiring ───────────────────────── */

function useMutations(params: MutationParams) {
  const { setSession, router, setError, pnpTimeLimit, pnpSpyCount, shouldPnpHideSpyCount } = params;

  const createRoomMutation = useMutation({
    mutationFn: async (hostName: string) => {
      const result = await createRoom({ hostName });
      return unwrapAction(result);
    },
    onSuccess: ({ playerId, code: roomCode, roomId }) => {
      setSession({ playerId, roomCode, roomId, isHost: true });
      router.push(`/room/${roomCode}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const joinRoomMutation = useMutation({
    mutationFn: async ({ playerName, roomCode }: { playerName: string; roomCode: string }) => {
      const result = await joinRoom({ playerName, roomCode });
      return unwrapAction(result);
    },
    onSuccess: ({ playerId, code: joinedCode, roomId }) => {
      setSession({ playerId, roomCode: joinedCode, roomId, isHost: false });
      router.push(`/room/${joinedCode}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const passAndPlayMutation = useMutation({
    mutationFn: async (trimmedNames: string[]) => {
      const createResult = await createPassAndPlayRoom({
        playerNames: trimmedNames,
        timeLimit: pnpTimeLimit,
        spyCount: pnpSpyCount,
        hideSpyCount: shouldPnpHideSpyCount,
        editions: params.pnpEditions,
      });
      const room = unwrapAction(createResult);
      const startResult = await startGame({ roomId: room.roomId, playerId: room.hostPlayerId });
      const game = unwrapAction(startResult);
      return { room, game };
    },
    onSuccess: ({ room, game }) => {
      setSession({
        playerId: room.hostPlayerId,
        roomCode: room.code,
        roomId: room.roomId,
        isHost: true,
        passAndPlay: true,
        allPlayers: room.players,
        gameId: game.gameId,
        gameStartedAt: game.startedAt,
        timeLimit: pnpTimeLimit,
        spyCount: pnpSpyCount,
        hideSpyCount: shouldPnpHideSpyCount,
      });
      router.push(`/room/${room.code}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const isLoading =
    createRoomMutation.isPending || joinRoomMutation.isPending || passAndPlayMutation.isPending;

  return { createRoomMutation, joinRoomMutation, passAndPlayMutation, isLoading };
}

/* ── Main hook ───────────────────────────────────────── */

export function useHomeState() {
  const router = useRouter();
  const { session, setSession } = useSession();
  const [mode, setMode] = useState<"idle" | "create" | "join" | "pass-and-play">("idle");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""]);
  const [pnpTimeLimit, setPnpTimeLimit] = useState(DEFAULT_TIME_LIMIT);
  const [pnpSpyCount, setPnpSpyCount] = useState(1);
  const [shouldPnpHideSpyCount, setPnpHideSpyCount] = useState(false);
  const [pnpEditions, setPnpEditions] = useState<Array<1 | 2>>([1, 2]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.roomCode) {
      router.replace(`/room/${session.roomCode}`);
    }
  }, [session, router]);

  const { createRoomMutation, joinRoomMutation, passAndPlayMutation, isLoading } = useMutations({
    setSession,
    router,
    setError,
    pnpTimeLimit,
    pnpSpyCount,
    shouldPnpHideSpyCount,
    pnpEditions,
  });

  const inputHandlers = useInputHandlers({ setName, setJoinCode, setPlayerNames, setError });
  const configHandlers = useConfigHandlers({
    setPnpTimeLimit,
    setPnpSpyCount,
    setPnpHideSpyCount,
    setPnpEditions,
  });
  const actionHandlers = useActionHandlers({
    name,
    joinCode,
    playerNames,
    setMode,
    setError,
    createRoomMutation,
    joinRoomMutation,
    passAndPlayMutation,
  });

  return {
    mode,
    name,
    joinCode,
    playerNames,
    isLoading,
    error,
    pnpTimeLimit,
    pnpSpyCount,
    shouldPnpHideSpyCount,
    pnpEditions,
    ...inputHandlers,
    ...configHandlers,
    ...actionHandlers,
  };
}
