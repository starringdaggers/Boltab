import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/jwt";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
};

const PROTECTED_PAGE_PREFIXES = ["/admin", "/teacher", "/student"];
const PROTECTED_API_PREFIXES = [
  "/api/admin",
  "/api/teacher",
  "/api/student",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isApiRoute = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isPageRoute = PROTECTED_PAGE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isApiRoute && !isPageRoute) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Figure out which role-prefix this path belongs to (page or API)
  const matchedRolePrefix = ["admin", "teacher", "student"].find((r) =>
    pathname.startsWith(`/${r}`) || pathname.startsWith(`/api/${r}`)
  );
  const expectedRole = matchedRolePrefix?.toUpperCase();

  if (expectedRole && session.role !== expectedRole) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    // Logged in but visiting a dashboard that isn't theirs — bounce home.
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/api/admin/:path*",
    "/api/teacher/:path*",
    "/api/student/:path*",
  ],
};
