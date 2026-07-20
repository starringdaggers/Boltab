import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
};

const PROTECTED_PREFIXES = ["/admin", "/teacher", "/student"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but visiting a dashboard that isn't theirs (e.g. a student
  // hitting /teacher directly) — bounce them to their own home instead.
  const ownPrefix = ROLE_HOME[session.role];
  if (!pathname.startsWith(ownPrefix)) {
    return NextResponse.redirect(new URL(ownPrefix, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
