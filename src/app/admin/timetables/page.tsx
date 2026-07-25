"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TimetableRow = { id: string; title: string; updatedAt: string };

export default function AdminTimetablesPage() {
  const [timetables, setTimetables] = useState<TimetableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/timetables");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Couldn't load timetables.");
          return;
        }
        setTimetables(data.timetables || []);
      } catch {
        setError("Couldn't reach the server. Check your connection.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-1">
        <h1 className="font-display text-3xl text-bistre font-semibold">Timetables</h1>
        <Link
          href="/admin/timetables/new"
          className="bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
        >
          New timetable
        </Link>
      </div>
      <p className="text-vandyke mb-8">
        Build a class timetable or a staff roster as a free-form grid —
        teachers and students can view these read-only from their own
        portals.
      </p>

      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : timetables.length === 0 ? (
        <p className="text-vandyke">No timetables yet — create your first one above.</p>
      ) : (
        <ul className="space-y-2">
          {timetables.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/timetables/${t.id}`}
                className="flex items-center justify-between bg-white/40 hover:bg-white/60 border border-taupe/30 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="text-bistre font-medium">{t.title}</span>
                <span className="text-vandyke text-xs">
                  Updated {new Date(t.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
