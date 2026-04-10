"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from "react";

import { createRoom, joinRoom } from "@/entities/room/actions";
import { useSession } from "@/shared/hooks/use-session";
import { unwrapAction } from "@/shared/lib/unwrap-action";

import { useActionHandlers, useInputHandlers } from "./use-home-handlers";

/* ── Types ──────────────────────────────────────────── */

interface MutationParams {
  setSession: ReturnType<typeof useSession>["setSession"];
  router: ReturnType<typeof useRouter>;
  setError: Dispatch<SetStateAction<string>>;
}

export type HomeStateMutations = ReturnType<typeof useMutations>;

/* ── Internal: mutation wiring ───────────────────────── */

function useMutations(params: MutationParams) {
  const { setSession, router, setError } = params;

  const createRoomMutation = useMutation({
    mutationFn: async (hostName: string) => {
      const result = await createRoom({ hostName });
      return unwrapAction(result);
    },
    onSuccess: ({ playerId, code: roomCode, roomId }) => {
      setSession({ mode: "online", playerId, roomCode, roomId, isHost: true });
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
      setSession({ mode: "online", playerId, roomCode: joinedCode, roomId, isHost: false });
      router.push(`/room/${joinedCode}`);
    },
    onError: (caughtError) => setError(caughtError.message),
  });

  const isLoading = createRoomMutation.isPending || joinRoomMutation.isPending;

  return { createRoomMutation, joinRoomMutation, isLoading };
}

/* ── Main hook ───────────────────────────────────────── */

export function useHomeState() {
  const router = useRouter();
  const { session, setSession } = useSession();
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.roomCode) {
      router.replace(`/room/${session.roomCode}`);
    }
  }, [session, router]);

  const { createRoomMutation, joinRoomMutation, isLoading } = useMutations({
    setSession,
    router,
    setError,
  });

  const inputHandlers = useInputHandlers({ setName, setJoinCode, setError });
  const actionHandlers = useActionHandlers({
    name,
    joinCode,
    setMode,
    setError,
    createRoomMutation,
    joinRoomMutation,
  });
  const handleOpenPassAndPlaySetup = useCallback(() => {
    router.push("/play/pass-and-play");
  }, [router]);

  return {
    mode,
    name,
    joinCode,
    isLoading,
    error,
    handleOpenPassAndPlaySetup,
    ...inputHandlers,
    ...actionHandlers,
  };
}
