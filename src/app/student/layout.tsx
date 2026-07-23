import DashboardShell from "@/components/shared/DashboardShell";
import { LayoutDashboard, Award, FileText, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/student", label: "Overview", icon: LayoutDashboard },
  { href: "/student/results", label: "My Results", icon: Award },
  { href: "/student/report-card", label: "Report Card", icon: FileText },
  { href: "/student/account", label: "Account", icon: Settings },
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
