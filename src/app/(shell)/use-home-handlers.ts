"use client";

import {
  type ChangeEvent,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
  useCallback,
} from "react";

import type { HomeStateMutations } from "./use-home-state";

type HomeMode = "idle" | "create" | "join";

/* ── Types ──────────────────────────────────────────── */

interface InputHandlerParams {
  setName: Dispatch<SetStateAction<string>>;
  setJoinCode: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
}

interface ActionHandlerParams {
  name: string;
  joinCode: string;
  setMode: Dispatch<SetStateAction<HomeMode>>;
  setError: Dispatch<SetStateAction<string>>;
  createRoomMutation: HomeStateMutations["createRoomMutation"];
  joinRoomMutation: HomeStateMutations["joinRoomMutation"];
}

/* ── Input handlers ──────────────────────────────────── */

export function useInputHandlers(params: InputHandlerParams) {
  const { setName, setJoinCode, setError } = params;

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [setName],
  );
  const handleJoinCodeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setJoinCode(event.target.value.toUpperCase()),
    [setJoinCode],
  );
  const handleNameSelect = useCallback((selected: string) => setName(selected), [setName]);
  const handleClearError = useCallback(() => setError(""), [setError]);

  return {
    handleNameChange,
    handleNameSelect,
    handleJoinCodeChange,
    handleClearError,
  };
}

/* ── Action handlers ─────────────────────────────────── */

export function useActionHandlers(params: ActionHandlerParams) {
  const { name, joinCode, setMode, setError, createRoomMutation, joinRoomMutation } = params;

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

  const handleCreateKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleCreateClick();
      }
    },
    [handleCreateClick],
  );
  const handleJoinKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleJoinClick();
      }
    },
    [handleJoinClick],
  );

  const handleSetModeCreate = useCallback(() => setMode("create"), [setMode]);
  const handleSetModeJoin = useCallback(() => setMode("join"), [setMode]);
  const handleBack = useCallback(() => {
    setMode("idle");
    setError("");
  }, [setMode, setError]);

  return {
    handleSetModeCreate,
    handleSetModeJoin,
    handleBack,
    handleCreateKeyDown,
    handleJoinKeyDown,
    handleCreateClick,
    handleJoinClick,
  };
}
