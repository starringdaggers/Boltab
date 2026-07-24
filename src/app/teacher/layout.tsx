import DashboardShell from "@/components/shared/DashboardShell";

const NAV_ITEMS = [
  { href: "/teacher", label: "Overview", icon: "dashboard" as const },
  { href: "/teacher/results", label: "Enter Results", icon: "results" as const },
  { href: "/teacher/report-card", label: "Report Card Details", icon: "reportCards" as const },
  { href: "/teacher/account", label: "Account", icon: "settings" as const },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell roleLabel="Teacher" navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}
