import { headers } from "next/headers";

import { getAuth } from "./auth";

/** Get authenticated user or null. Non-throwing — safe for optional auth checks. */
export async function getAuthUser() {
  try {
    const session = await getAuth().api.getSession({
      headers: await headers(),
    });
    return session?.user ?? null;
  } catch {
    return null;
  }
}
