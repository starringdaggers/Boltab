import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE_NAME, SessionPayload } from "@/lib/jwt";

/**
 * Reads and verifies the session cookie. Returns null if missing/invalid.
 * Use this inside Server Components, Route Handlers, and Server Actions —
 * anywhere `next/headers` is available.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

/**
 * Guard for API routes: returns the session only if it matches one of the
 * allowed roles, otherwise null. Callers should return a 401/403 response
 * when this returns null — middleware covers page routes, but API routes
 * are checked again here in case they're ever hit directly.
 */
export async function requireRole(
  ...roles: SessionPayload["role"][]
): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  if (!roles.includes(session.role)) return null;
  return session;
}
