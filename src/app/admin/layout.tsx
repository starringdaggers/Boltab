import DashboardShell from "@/components/shared/DashboardShell";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "dashboard" as const },
  { href: "/admin/classes", label: "Classes", icon: "classes" as const },
  { href: "/admin/subjects", label: "Subjects", icon: "subjects" as const },
  { href: "/admin/terms", label: "Terms", icon: "terms" as const },
  { href: "/admin/teachers", label: "Teachers", icon: "teachers" as const },
  { href: "/admin/students", label: "Students", icon: "students" as const },
  { href: "/admin/report-cards", label: "Report Cards", icon: "reportCards" as const },
  { href: "/admin/account", label: "Account", icon: "settings" as const },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell roleLabel="Admin" navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}
