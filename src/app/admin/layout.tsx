import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/terms", label: "Terms" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/students", label: "Students" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-antique">
      <aside className="w-60 shrink-0 bg-bistre flex flex-col">
        <div className="px-6 py-6 border-b border-taupe/20">
          <p className="font-mono text-[10px] tracking-[0.2em] text-taupe uppercase">
            Boltab Brilliant Schools
          </p>
          <p className="font-display text-lg text-antique font-semibold mt-1">
            Admin
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-taupe hover:bg-vandyke hover:text-antique transition-colors text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-taupe/20">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
