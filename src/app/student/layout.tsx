import DashboardShell from "@/components/shared/DashboardShell";

const NAV_ITEMS = [
  { href: "/student", label: "Overview" },
  { href: "/student/results", label: "My Results" },
  { href: "/student/report-card", label: "Report Card" },
  { href: "/student/account", label: "Account" },
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
