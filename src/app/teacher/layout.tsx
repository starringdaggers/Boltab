import DashboardShell, { NavItem } from "@/components/shared/DashboardShell";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const BASE_NAV_ITEMS: NavItem[] = [
  { href: "/teacher", label: "Overview", icon: "dashboard" },
  { href: "/teacher/results", label: "Enter Results", icon: "results" },
  { href: "/teacher/report-card", label: "Report Card Details", icon: "reportCards" },
  { href: "/teacher/attendance", label: "Attendance", icon: "attendance" },
  { href: "/teacher/timetable", label: "Timetable", icon: "timetable" },
  { href: "/teacher/account", label: "Account", icon: "settings" },
];

// Delegated admin sections a teacher might have been granted — each maps
// straight to the real /admin page, reusing it rather than duplicating UI.
const DELEGATABLE_NAV: { field: string; href: string; label: string; icon: NavItem["icon"] }[] = [
  { field: "canManageClasses", href: "/admin/classes", label: "Admin: Classes", icon: "classes" },
  { field: "canManageSubjects", href: "/admin/subjects", label: "Admin: Subjects", icon: "subjects" },
  { field: "canManageTerms", href: "/admin/terms", label: "Admin: Terms", icon: "terms" },
  { field: "canManageStudents", href: "/admin/students", label: "Admin: Students", icon: "students" },
  { field: "canManageReportCards", href: "/admin/report-cards", label: "Admin: Report Cards", icon: "reportCards" },
  { field: "canManageAttendance", href: "/admin/attendance", label: "Admin: Attendance", icon: "attendance" },
];

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  let navItems: NavItem[] = BASE_NAV_ITEMS;

  if (session) {
    const teacher = await db.teacher.findUnique({ where: { userId: session.userId } });
    const delegation = teacher
      ? await db.adminDelegation.findUnique({ where: { teacherId: teacher.id } })
      : null;

    if (delegation) {
      const extra = DELEGATABLE_NAV.filter(
        (d) => (delegation as unknown as Record<string, boolean>)[d.field]
      ).map((d) => ({ href: d.href, label: d.label, icon: d.icon }));
      if (extra.length > 0) {
        navItems = [...BASE_NAV_ITEMS, ...extra];
      }
    }
  }

  return (
    <DashboardShell roleLabel="Teacher" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
