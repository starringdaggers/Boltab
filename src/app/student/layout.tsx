import DashboardShell from "@/components/shared/DashboardShell";

const NAV_ITEMS = [
  { href: "/student", label: "Overview", icon: "dashboard" as const },
  { href: "/student/results", label: "My Results", icon: "award" as const },
  { href: "/student/report-card", label: "Report Card", icon: "reportCards" as const },
  { href: "/student/account", label: "Account", icon: "settings" as const },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell roleLabel="Student" navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}
