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

// Admin sections a TEACHER account MAY be delegated access to. This is only
// a coarse gate — it just lets the request past the role check. The real,
// fine-grained "does THIS teacher actually have THIS permission" check
// happens inside each route handler via requireAdminAccess(), since that
// needs a database lookup and middleware runs on the Edge Runtime, which
// can't reliably run Prisma queries (same constraint that caused the CSP
// hydration bug earlier — Edge Runtime has real limits on what can run in it).
//
// Deliberately NOT included here: /admin/teachers, /admin/fees,
// /admin/profile-pictures, /admin/delegates (and their /api equivalents) —
// those stay strictly admin-only no matter what, so a delegate can never
// manage other teachers, money, identity approvals, or grant themselves
// more access.
const DELEGABLE_ADMIN_PATHS = [
  "/admin/classes",
  "/admin/subjects",
  "/admin/terms",
  "/admin/students",
  "/admin/report-cards",
  "/admin/attendance",
  "/api/admin/classes",
  "/api/admin/subjects",
  "/api/admin/terms",
  "/api/admin/students",
  "/api/admin/report-cards",
  "/api/admin/attendance",
];

function isDelegablePath(pathname: string): boolean {
  return DELEGABLE_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

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

  // A TEACHER hitting a delegable /admin path gets a pass here — the route
  // itself decides whether THIS teacher actually has THAT permission.
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    session.role === "TEACHER" &&
    isDelegablePath(pathname)
  ) {
    return NextResponse.next();
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
