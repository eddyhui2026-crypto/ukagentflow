/**
 * Next.js 16 still runs this file, but the `middleware` filename is deprecated in favour of `proxy`.
 * When you upgrade workflow, follow https://nextjs.org/docs/messages/middleware-to-proxy — e.g.
 * `npx @next/codemod@canary middleware-to-proxy .` then re-test Auth.js wrapping.
 */
import { auth } from "@/auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";

/** `!!req.auth` is unsafe — session JSON can be a truthy object without a user. */
function hasUserSession(session: Session | null | undefined): boolean {
  const id = session?.user?.id;
  return typeof id === "string" && id.length > 0;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = hasUserSession(req.auth);

  const needsAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/internal");

  if (needsAuth && !isAuthed) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password") &&
    isAuthed
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/properties/:path*",
    "/settings/:path*",
    "/reports",
    "/reports/:path*",
    "/internal/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
