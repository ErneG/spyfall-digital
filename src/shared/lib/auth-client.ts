"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient(
  typeof window === "undefined" ? undefined : { baseURL: window.location.origin },
);
