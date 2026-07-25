"use client";

import { useEffect, useState } from "react";
import TimetableBuilder from "@/components/timetable/TimetableBuilder";

export default function EditTimetablePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ title: string; columns: string[]; rows: string[][] } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/timetables/${params.id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Couldn't load this timetable.");
          return;
        }
        setData(json.timetable);
      } catch {
        setError("Couldn't reach the server. Check your connection.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Edit timetable
      </h1>
      <p className="text-vandyke mb-8">
        Changes here are visible to every teacher and student right away.
      </p>

      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : data ? (
        <TimetableBuilder
          timetableId={params.id}
          initialTitle={data.title}
          initialColumns={data.columns}
          initialRows={data.rows}
        />
      ) : null}
    </div>
  );
}
