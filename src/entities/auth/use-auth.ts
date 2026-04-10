"use client";

import { useCallback } from "react";

import { authClient } from "@/shared/lib/auth-client";

export function useAuth() {
  const { data: session, isPending } = authClient.useSession();

  const sessionUser = session?.user;
  const user = sessionUser
    ? {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        image: sessionUser.image,
      }
    : null;

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isPending,
    signOut,
  };
}
