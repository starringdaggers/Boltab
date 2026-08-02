"use client";

import { useEffect, useState } from "react";

type Term = { id: string; name: string; academicYear: string };
type Record_ = { date: string; status: string };

export default function StudentAttendancePage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const [summary, setSummary] = useState<{ present: number; late: number; absent: number; total: number } | null>(null);
  const [records, setRecords] = useState<Record_[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    async function loadTerms() {
      setLoadingTerms(true);
      const res = await fetch("/api/student/terms");
      const data = await res.json();
      const termList: Term[] = data.terms || [];
      setTerms(termList);
      if (termList.length > 0) setSelectedTermId(termList[0].id);
      setLoadingTerms(false);
    }
    loadTerms();
  }, []);

  useEffect(() => {
    async function loadRecords() {
      if (!selectedTermId) return;
      setLoadingRecords(true);
      const res = await fetch(`/api/student/attendance?termId=${selectedTermId}`);
      const data = await res.json();
      setSummary(data.summary || null);
      setRecords(data.records || []);
      setLoadingRecords(false);
    }
    loadRecords();
  }, [selectedTermId]);

  const percent = summary && summary.total > 0
    ? Math.round(((summary.present + summary.late) / summary.total) * 100)
    : null;

  return (
    <div className="p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">Attendance</h1>
      <p className="text-vandyke mb-6">Your attendance record for the selected term.</p>

      {loadingTerms ? (
        <p className="text-vandyke">Loading…</p>
      ) : terms.length === 0 ? (
        <p className="text-vandyke">No terms have been set up yet.</p>
      ) : (
        <select
          value={selectedTermId}
          onChange={(e) => setSelectedTermId(e.target.value)}
          className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 mb-6 max-w-xs"
        >
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.academicYear}
            </option>
          ))}
        </select>
      )}

      {loadingRecords ? (
        <p className="text-vandyke">Loading…</p>
      ) : summary && summary.total > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl">
            <div className="bg-white/40 border border-taupe/30 rounded-card p-5">
              <p className="font-mono text-xs tracking-wide text-vandyke uppercase mb-1">Present</p>
              <p className="font-display text-3xl text-status-pass font-semibold">{summary.present}</p>
            </div>
            <div className="bg-white/40 border border-taupe/30 rounded-card p-5">
              <p className="font-mono text-xs tracking-wide text-vandyke uppercase mb-1">Late</p>
              <p className="font-display text-3xl text-status-warn font-semibold">{summary.late}</p>
            </div>
            <div className="bg-white/40 border border-taupe/30 rounded-card p-5">
              <p className="font-mono text-xs tracking-wide text-vandyke uppercase mb-1">Absent</p>
              <p className="font-display text-3xl text-status-fail font-semibold">{summary.absent}</p>
            </div>
            <div className="bg-white/40 border border-taupe/30 rounded-card p-5">
              <p className="font-mono text-xs tracking-wide text-vandyke uppercase mb-1">Attendance</p>
              <p className="font-display text-3xl text-bistre font-semibold">{percent}%</p>
            </div>
          </div>

          <div className="max-w-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-vandyke border-b border-taupe/30">
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className="border-b border-taupe/10">
                    <td className="py-2 text-bistre">
                      {new Date(r.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.status === "PRESENT"
                            ? "bg-status-pass/10 text-status-pass"
                            : r.status === "LATE"
                            ? "bg-status-warn/10 text-status-warn"
                            : "bg-status-fail/10 text-status-fail"
                        }`}
                      >
                        {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-vandyke">No attendance has been recorded for you yet this term.</p>
      )}
    </div>
  );
}
