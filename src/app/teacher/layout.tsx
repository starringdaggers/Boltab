import DashboardShell from "@/components/shared/DashboardShell";

const NAV_ITEMS = [
  { href: "/teacher", label: "Overview" },
  { href: "/teacher/results", label: "Enter Results" },
  { href: "/teacher/report-card", label: "Report Card Details" },
  { href: "/teacher/account", label: "Account" },
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
