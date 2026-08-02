"use client";

import { useEffect, useState } from "react";

type Option = { id: string; name: string };
type Term = { id: string; name: string; academicYear: string };
type RosterRow = {
  studentId: string;
  name: string;
  admissionNo: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  percent: number | null;
};

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState<Option[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      const [classesRes, termsRes] = await Promise.all([
        fetch("/api/admin/classes"),
        fetch("/api/admin/terms"),
      ]);
      setClasses((await classesRes.json()).classes || []);
      setTerms((await termsRes.json()).terms || []);
      setLoadingOptions(false);
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadRoster() {
      if (!selectedClassId || !selectedTermId) {
        setRoster([]);
        return;
      }
      setLoadingRoster(true);
      const params = new URLSearchParams({ classId: selectedClassId, termId: selectedTermId });
      const res = await fetch(`/api/admin/attendance?${params}`);
      const data = await res.json();
      setRoster(data.roster || []);
      setLoadingRoster(false);
    }
    loadRoster();
  }, [selectedClassId, selectedTermId]);

  return (
    <div className="p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">Attendance</h1>
      <p className="text-vandyke mb-6">
        Pick a class and term to see every student's attendance record.
      </p>

      {loadingOptions ? (
        <p className="text-vandyke">Loading…</p>
      ) : (
        <div className="flex flex-wrap gap-3 mb-6 max-w-2xl">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="flex-1 min-w-[160px] border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
          >
            <option value="">Select class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="flex-1 min-w-[160px] border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
          >
            <option value="">Select term…</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.academicYear}
              </option>
            ))}
          </select>
        </div>
      )}

      {loadingRoster ? (
        <p className="text-vandyke">Loading…</p>
      ) : roster.length > 0 ? (
        <div className="overflow-x-auto max-w-3xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-vandyke border-b border-taupe/30">
                <th className="py-2 font-medium">Student</th>
                <th className="py-2 font-medium">Admission No.</th>
                <th className="py-2 font-medium">Present</th>
                <th className="py-2 font-medium">Late</th>
                <th className="py-2 font-medium">Absent</th>
                <th className="py-2 font-medium">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.studentId} className="border-b border-taupe/10">
                  <td className="py-2 text-bistre">{r.name}</td>
                  <td className="py-2 font-mono text-vandyke">{r.admissionNo}</td>
                  <td className="py-2 font-mono text-status-pass">{r.present}</td>
                  <td className="py-2 font-mono text-status-warn">{r.late}</td>
                  <td className="py-2 font-mono text-status-fail">{r.absent}</td>
                  <td className="py-2 font-mono text-bistre">
                    {r.percent !== null ? `${r.percent}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedClassId && selectedTermId ? (
        <p className="text-vandyke">No attendance recorded for this class yet.</p>
      ) : null}
    </div>
  );
}
