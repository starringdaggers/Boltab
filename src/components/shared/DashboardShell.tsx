"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export default function DashboardShell({
  roleLabel,
  navItems,
  children,
}: {
  roleLabel: string;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const sidebarInner = (
    <>
      <div className="px-6 py-6 border-b border-taupe/20">
        <p className="font-mono text-[10px] tracking-[0.2em] text-taupe uppercase">
          Boltab Brilliant Schools
        </p>
        <p className="font-display text-lg text-antique font-semibold mt-1">
          {roleLabel}
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                active
                  ? "bg-antique text-bistre border-antique shadow-sm"
                  : "text-taupe border-taupe/25 hover:border-taupe/50 hover:bg-white/5"
              }`}
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-taupe/20">
        <LogoutButton />
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-antique">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-ocean-sunset flex items-center justify-between px-4 h-14 print:hidden">
        <div>
          <p className="font-mono text-[9px] tracking-[0.15em] text-taupe uppercase">
            Boltab Brilliant Schools
          </p>
          <p className="font-display text-sm text-antique font-semibold">{roleLabel}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-antique active:bg-vandyke"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer + backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex print:hidden">
          <div
            className="absolute inset-0 bg-bistre/60"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-ocean-sunset flex flex-col h-full">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg text-antique active:bg-vandyke"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="5" x2="19" y2="19" strokeLinecap="round" />
                <line x1="19" y1="5" x2="5" y2="19" strokeLinecap="round" />
              </svg>
            </button>
            {sidebarInner}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-ocean-sunset flex-col print:hidden">
        {sidebarInner}
      </aside>

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0 print:pt-0 print:overflow-visible">
        {children}
      </main>
    </div>
  );
}
