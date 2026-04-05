import { headers } from "next/headers";

import { auth } from "./auth";

/** Get authenticated user or null. Non-throwing — safe for optional auth checks. */
export async function getAuthUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user ?? null;
  } catch {
    return null;
  }
}
