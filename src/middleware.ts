import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Redirect unauthenticated users away from protected routes
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/collections/:path*"],
};
