import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SessionPayload } from "@/lib/jwt";

export type AdminPermission =
  | "classes"
  | "subjects"
  | "terms"
  | "students"
  | "reportCards"
  | "attendance";

const PERMISSION_FIELD: Record<AdminPermission, string> = {
  classes: "canManageClasses",
  subjects: "canManageSubjects",
  terms: "canManageTerms",
  students: "canManageStudents",
  reportCards: "canManageReportCards",
  attendance: "canManageAttendance",
};

/**
 * Returns the session if the caller is allowed to act on the given admin
 * section — either because they're a real ADMIN, or because they're a
 * TEACHER an admin has explicitly delegated that specific permission to.
 *
 * Deliberately does NOT cover teacher management, fees, profile-picture
 * approval, or delegation management itself — those always require a real
 * ADMIN role, regardless of any delegation, so a delegate can never expand
 * their own access.
 */
export async function requireAdminAccess(
  permission: AdminPermission
): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "ADMIN") return session;
  if (session.role !== "TEACHER") return null;

  const teacher = await db.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) return null;

  const delegation = await db.adminDelegation.findUnique({
    where: { teacherId: teacher.id },
  });
  if (!delegation) return null;

  const field = PERMISSION_FIELD[permission] as keyof typeof delegation;
  return delegation[field] ? session : null;
}
