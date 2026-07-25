"use client";

import { useEffect, useState } from "react";
import TimetableGrid from "@/components/timetable/TimetableGrid";

type Timetable = { id: string; title: string; columns: string[]; rows: string[][] };

export default function StudentTimetablePage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/timetables");
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
    <div className="p-5 sm:p-8 lg:p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">Timetable</h1>
      <p className="text-vandyke mb-8">
        Published by the school office. Read-only from here.
      </p>

      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : timetables.length === 0 ? (
        <p className="text-vandyke">No timetables have been published yet.</p>
      ) : (
        <div className="space-y-10">
          {timetables.map((t) => (
            <div key={t.id}>
              <h2 className="font-display text-xl text-bistre font-semibold mb-3">
                {t.title}
              </h2>
              <TimetableGrid columns={t.columns} rows={t.rows} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
