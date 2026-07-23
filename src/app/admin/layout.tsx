import DashboardShell from "@/components/shared/DashboardShell";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CalendarRange,
  Users,
  UserRound,
  FileText,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/classes", label: "Classes", icon: GraduationCap },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/terms", label: "Terms", icon: CalendarRange },
  { href: "/admin/teachers", label: "Teachers", icon: Users },
  { href: "/admin/students", label: "Students", icon: UserRound },
  { href: "/admin/report-cards", label: "Report Cards", icon: FileText },
  { href: "/admin/account", label: "Account", icon: Settings },
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
