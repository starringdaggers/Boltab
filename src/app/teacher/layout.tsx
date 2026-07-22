import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function TeacherLayout({
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
            Teacher
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/teacher"
            className="block px-3 py-2 rounded-lg text-taupe hover:bg-vandyke hover:text-antique transition-colors text-sm"
          >
            Overview
          </Link>
          <Link
            href="/teacher/results"
            className="block px-3 py-2 rounded-lg text-taupe hover:bg-vandyke hover:text-antique transition-colors text-sm"
          >
            Enter Results
          </Link>
          <Link
            href="/teacher/report-card"
            className="block px-3 py-2 rounded-lg text-taupe hover:bg-vandyke hover:text-antique transition-colors text-sm"
          >
            Report Card Details
          </Link>
          <Link
            href="/teacher/account"
            className="block px-3 py-2 rounded-lg text-taupe hover:bg-vandyke hover:text-antique transition-colors text-sm"
          >
            Account
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-taupe/20">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
