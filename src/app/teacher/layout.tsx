import DashboardShell from "@/components/shared/DashboardShell";
import { LayoutDashboard, ClipboardList, FileText, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/teacher", label: "Overview", icon: LayoutDashboard },
  { href: "/teacher/results", label: "Enter Results", icon: ClipboardList },
  { href: "/teacher/report-card", label: "Report Card Details", icon: FileText },
  { href: "/teacher/account", label: "Account", icon: Settings },
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
