"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useEffect } from "react";

import { startGame } from "@/domains/game/actions";
import { createRoom, joinRoom, createPassAndPlayRoom } from "@/domains/room/actions";
import { useSession } from "@/shared/hooks/use-session";
import { DEFAULT_TIME_LIMIT } from "@/shared/lib/constants";
import { unwrapAction } from "@/shared/lib/unwrap-action";

/* ── Internal: mutation wiring ───────────────────────── */

function useMutations(
  setSession: ReturnType<typeof useSession>["setSession"],
  router: ReturnType<typeof useRouter>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  pnpTimeLimit: number,
  pnpSpyCount: number,
  shouldPnpHideSpyCount: boolean,
) {
  const createRoomMutation = useMutation({
    mutationFn: (hostName: string) => createRoom({ hostName }).then(unwrapAction),
    onSuccess: ({ playerId, code: roomCode, roomId }) => {
      setSession({ playerId, roomCode, roomId, isHost: true });
      router.push(`/room/${roomCode}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const joinRoomMutation = useMutation({
    mutationFn: ({ playerName, roomCode }: { playerName: string; roomCode: string }) =>
      joinRoom({ playerName, roomCode }).then(unwrapAction),
    onSuccess: ({ playerId, code: joinedCode, roomId }) => {
      setSession({ playerId, roomCode: joinedCode, roomId, isHost: false });
      router.push(`/room/${joinedCode}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const passAndPlayMutation = useMutation({
    mutationFn: async (trimmedNames: string[]) => {
      const room = await createPassAndPlayRoom({
        playerNames: trimmedNames,
        timeLimit: pnpTimeLimit,
        spyCount: pnpSpyCount,
        hideSpyCount: shouldPnpHideSpyCount,
      }).then(unwrapAction);
      await startGame({ roomId: room.roomId, playerId: room.hostPlayerId }).then(unwrapAction);
      return room;
    },
    onSuccess: ({ hostPlayerId, code: roomCode, roomId, players }) => {
      setSession({
        playerId: hostPlayerId,
        roomCode,
        roomId,
        isHost: true,
        passAndPlay: true,
        allPlayers: players,
      });
      router.push(`/room/${roomCode}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const isLoading =
    createRoomMutation.isPending || joinRoomMutation.isPending || passAndPlayMutation.isPending;

  return { createRoomMutation, joinRoomMutation, passAndPlayMutation, isLoading };
}

/* ── Internal: callback handlers ─────────────────────── */

function useHandlers(
  name: string,
  joinCode: string,
  playerNames: string[],
  setMode: React.Dispatch<React.SetStateAction<"idle" | "create" | "join" | "pass-and-play">>,
  setName: React.Dispatch<React.SetStateAction<string>>,
  setJoinCode: React.Dispatch<React.SetStateAction<string>>,
  setPlayerNames: React.Dispatch<React.SetStateAction<string[]>>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setPnpTimeLimit: React.Dispatch<React.SetStateAction<number>>,
  setPnpSpyCount: React.Dispatch<React.SetStateAction<number>>,
  setPnpHideSpyCount: React.Dispatch<React.SetStateAction<boolean>>,
  createRoomMutation: ReturnType<typeof useMutations>["createRoomMutation"],
  joinRoomMutation: ReturnType<typeof useMutations>["joinRoomMutation"],
  passAndPlayMutation: ReturnType<typeof useMutations>["passAndPlayMutation"],
) {
  const handlePnpTimeLimitChange = useCallback(
    (value: number) => setPnpTimeLimit(value),
    [setPnpTimeLimit],
  );
  const handlePnpSpyCountChange = useCallback(
    (value: number) => setPnpSpyCount(value),
    [setPnpSpyCount],
  );
  const handlePnpHideSpyCountChange = useCallback(
    (checked: boolean) => setPnpHideSpyCount(checked),
    [setPnpHideSpyCount],
  );

  const handleCreateClick = useCallback(() => {
    if (!name.trim()) {
      setError("enterName");
      return;
    }
    setError("");
    createRoomMutation.mutate(name.trim());
  }, [name, createRoomMutation, setError]);

  const handleJoinClick = useCallback(() => {
    if (!name.trim()) {
      setError("enterName");
      return;
    }
    if (!joinCode.trim()) {
      setError("enterRoomCode");
      return;
    }
    setError("");
    joinRoomMutation.mutate({ playerName: name.trim(), roomCode: joinCode.trim().toUpperCase() });
  }, [name, joinCode, joinRoomMutation, setError]);

  const handlePassAndPlayClick = useCallback(() => {
    const trimmed = playerNames.map((n) => n.trim());
    if (trimmed.some((n) => !n)) {
      setError("allNamesRequired");
      return;
    }
    const unique = new Set(trimmed.map((n) => n.toLowerCase()));
    if (unique.size !== trimmed.length) {
      setError("uniqueNames");
      return;
    }
    setError("");
    passAndPlayMutation.mutate(trimmed);
  }, [playerNames, passAndPlayMutation, setError]);

  const handleSetModeCreate = useCallback(() => setMode("create"), [setMode]);
  const handleSetModeJoin = useCallback(() => setMode("join"), [setMode]);
  const handleSetModePassAndPlay = useCallback(() => setMode("pass-and-play"), [setMode]);
  const handleBack = useCallback(() => {
    setMode("idle");
    setError("");
  }, [setMode, setError]);
  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [setName],
  );
  const handleJoinCodeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setJoinCode(event.target.value.toUpperCase()),
    [setJoinCode],
  );
  const handleCreateKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") handleCreateClick();
    },
    [handleCreateClick],
  );
  const handleJoinKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") handleJoinClick();
    },
    [handleJoinClick],
  );
  const handlePlayerNameChange = useCallback(
    (index: number, value: string) => {
      setPlayerNames((previous) => {
        const next = [...previous];
        next[index] = value;
        return next;
      });
    },
    [setPlayerNames],
  );
  const handleAddPlayer = useCallback(() => {
    setPlayerNames((previous) => [...previous, ""]);
  }, [setPlayerNames]);
  const handleRemovePlayer = useCallback(
    (index: number) => {
      setPlayerNames((previous) => previous.filter((_, i) => i !== index));
    },
    [setPlayerNames],
  );

  return {
    handleSetModeCreate,
    handleSetModeJoin,
    handleSetModePassAndPlay,
    handleBack,
    handleNameChange,
    handleJoinCodeChange,
    handleCreateKeyDown,
    handleJoinKeyDown,
    handleCreateClick,
    handleJoinClick,
    handlePassAndPlayClick,
    handlePlayerNameChange,
    handleAddPlayer,
    handleRemovePlayer,
    handlePnpTimeLimitChange,
    handlePnpSpyCountChange,
    handlePnpHideSpyCountChange,
  };
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
  const [error, setError] = useState("");

  // Auto-redirect to active room if session exists
  useEffect(() => {
    if (session?.roomCode) {
      router.replace(`/room/${session.roomCode}`);
    }
  }, [session, router]);

  const { createRoomMutation, joinRoomMutation, passAndPlayMutation, isLoading } = useMutations(
    setSession,
    router,
    setError,
    pnpTimeLimit,
    pnpSpyCount,
    shouldPnpHideSpyCount,
  );

  const handlers = useHandlers(
    name,
    joinCode,
    playerNames,
    setMode,
    setName,
    setJoinCode,
    setPlayerNames,
    setError,
    setPnpTimeLimit,
    setPnpSpyCount,
    setPnpHideSpyCount,
    createRoomMutation,
    joinRoomMutation,
    passAndPlayMutation,
  );

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
    ...handlers,
  };
}
