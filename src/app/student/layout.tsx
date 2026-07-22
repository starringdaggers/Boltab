import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-antique">
      <aside className="w-60 shrink-0 bg-bistre flex flex-col print:hidden">
        <div className="px-6 py-6 border-b border-taupe/20">
          <p className="font-mono text-[10px] tracking-[0.2em] text-taupe uppercase">
            Boltab Brilliant Schools
          </p>
          <p className="font-display text-lg text-antique font-semibold mt-1">
            Student
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/student"
            className="block px-3 py-2 rounded-lg text-taupe hover:bg-vandyke hover:text-antique transition-colors text-sm"
          >
            Overview
          </Link>
          <Link
            href="/student/results"
            className="block px-3 py-2 rounded-lg text-taupe hover:bg-vandyke hover:text-antique transition-colors text-sm"
          >
            My Results
          </Link>
          <Link
            href="/student/report-card"
            className="block px-3 py-2 rounded-lg text-taupe hover:bg-vandyke hover:text-antique transition-colors text-sm"
          >
            Report Card
          </Link>
          <Link
            href="/student/account"
            className="block px-3 py-2 rounded-lg text-taupe hover:bg-vandyke hover:text-antique transition-colors text-sm"
          >
            Account
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-taupe/20">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto print:overflow-visible">{children}</main>
    </div>
  );
}
