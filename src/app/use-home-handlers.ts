"use client";

import {
  type ChangeEvent,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
  useCallback,
} from "react";

import type { HomeStateMutations } from "./use-home-state";

/* ── Types ──────────────────────────────────────────── */

interface InputHandlerParams {
  setName: Dispatch<SetStateAction<string>>;
  setJoinCode: Dispatch<SetStateAction<string>>;
  setPlayerNames: Dispatch<SetStateAction<string[]>>;
  setError: Dispatch<SetStateAction<string>>;
}

interface ConfigHandlerParams {
  setPnpTimeLimit: Dispatch<SetStateAction<number>>;
  setPnpSpyCount: Dispatch<SetStateAction<number>>;
  setPnpHideSpyCount: Dispatch<SetStateAction<boolean>>;
  setPnpCategories: Dispatch<SetStateAction<string[]>>;
}

interface ActionHandlerParams {
  name: string;
  joinCode: string;
  playerNames: string[];
  setMode: Dispatch<SetStateAction<"idle" | "create" | "join" | "pass-and-play">>;
  setError: Dispatch<SetStateAction<string>>;
  createRoomMutation: HomeStateMutations["createRoomMutation"];
  joinRoomMutation: HomeStateMutations["joinRoomMutation"];
  passAndPlayMutation: HomeStateMutations["passAndPlayMutation"];
}

/* ── Input handlers ──────────────────────────────────── */

export function useInputHandlers(params: InputHandlerParams) {
  const { setName, setJoinCode, setPlayerNames, setError } = params;

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [setName],
  );
  const handleJoinCodeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setJoinCode(event.target.value.toUpperCase()),
    [setJoinCode],
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
  const handleReorderPlayers = useCallback(
    (newNames: string[]) => setPlayerNames(newNames),
    [setPlayerNames],
  );
  const handleNameSelect = useCallback((selected: string) => setName(selected), [setName]);
  const handleClearError = useCallback(() => setError(""), [setError]);

  return {
    handleNameChange,
    handleNameSelect,
    handleJoinCodeChange,
    handlePlayerNameChange,
    handleAddPlayer,
    handleRemovePlayer,
    handleReorderPlayers,
    handleClearError,
  };
}

/* ── Config handlers ─────────────────────────────────── */

export function useConfigHandlers(params: ConfigHandlerParams) {
  const { setPnpTimeLimit, setPnpSpyCount, setPnpHideSpyCount, setPnpCategories } = params;

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

  const handlePnpCategoriesChange = useCallback(
    (categories: string[]) => setPnpCategories(categories),
    [setPnpCategories],
  );

  return {
    handlePnpTimeLimitChange,
    handlePnpSpyCountChange,
    handlePnpHideSpyCountChange,
    handlePnpCategoriesChange,
  };
}

/* ── Action handlers ─────────────────────────────────── */

export function useActionHandlers(params: ActionHandlerParams) {
  const {
    name,
    joinCode,
    playerNames,
    setMode,
    setError,
    createRoomMutation,
    joinRoomMutation,
    passAndPlayMutation,
  } = params;

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
  const handleSetModePassAndPlay = useCallback(() => setMode("pass-and-play"), [setMode]);
  const handleBack = useCallback(() => {
    setMode("idle");
    setError("");
  }, [setMode, setError]);

  return {
    handleSetModeCreate,
    handleSetModeJoin,
    handleSetModePassAndPlay,
    handleBack,
    handleCreateKeyDown,
    handleJoinKeyDown,
    handleCreateClick,
    handleJoinClick,
    handlePassAndPlayClick,
  };
}
