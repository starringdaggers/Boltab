"use client";

import { useEffect, useState } from "react";

type Option = { id: string; name: string };
type Term = { id: string; name: string; academicYear: string };
type RosterEntry = {
  studentId: string;
  name: string;
  admissionNo: string;
  status: "PRESENT" | "ABSENT" | "LATE" | null;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_OPTIONS: { value: "PRESENT" | "ABSENT" | "LATE"; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "LATE", label: "Late" },
  { value: "ABSENT", label: "Absent" },
];

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<Option[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [date, setDate] = useState(todayISO());

  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [statuses, setStatuses] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      const [classesRes, termsRes] = await Promise.all([
        fetch("/api/teacher/classes"),
        fetch("/api/teacher/terms"),
      ]);
      setClasses((await classesRes.json()).classes || []);
      const termList: Term[] = (await termsRes.json()).terms || [];
      setTerms(termList);
      if (termList.length > 0) setSelectedTermId(termList[0].id);
      setLoadingOptions(false);
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadRoster() {
      if (!selectedClassId || !selectedTermId || !date) {
        setRoster([]);
        return;
      }
      setLoadingRoster(true);
      setMessage(null);
      const params = new URLSearchParams({ classId: selectedClassId, termId: selectedTermId, date });
      const res = await fetch(`/api/teacher/attendance?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        setRoster([]);
        setLoadingRoster(false);
        return;
      }
      setRoster(data.roster);
      const initial: typeof statuses = {};
      for (const entry of data.roster as RosterEntry[]) {
        initial[entry.studentId] = entry.status || "PRESENT";
      }
      setStatuses(initial);
      setLoadingRoster(false);
    }
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, selectedTermId, date]);

  function setAll(status: "PRESENT" | "ABSENT" | "LATE") {
    const next: typeof statuses = {};
    for (const r of roster) next[r.studentId] = status;
    setStatuses(next);
  }

  async function handleSubmit() {
    if (!selectedClassId || !selectedTermId || !date) return;
    setMessage(null);
    setSaving(true);
    const entries = roster.map((r) => ({
      studentId: r.studentId,
      status: statuses[r.studentId] || "PRESENT",
    }));
    const res = await fetch("/api/teacher/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClassId, termId: selectedTermId, date, entries }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error });
      return;
    }
    setMessage({ type: "success", text: `Saved attendance for ${data.saved} student(s).` });
  }

  return (
    <div className="p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">Attendance</h1>
      <p className="text-vandyke mb-6">
        Pick a class and a date, then mark everyone present, absent, or late.
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
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayISO()}
            className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
          />
        </div>
      )}

      {message && (
        <p
          className={`text-sm mb-4 px-3 py-2 rounded-lg border inline-block ${
            message.type === "success"
              ? "text-status-pass bg-status-pass/10 border-status-pass/30"
              : "text-status-fail bg-status-fail/10 border-status-fail/30"
          }`}
        >
          {message.text}
        </p>
      )}

      {loadingRoster ? (
        <p className="text-vandyke">Loading roster…</p>
      ) : roster.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-3 text-xs">
            <span className="text-vandyke">Mark everyone:</span>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setAll(s.value)}
                className="px-2.5 py-1 rounded-full border border-taupe/40 text-vandyke hover:border-choc transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="text-left text-vandyke border-b border-taupe/30">
                  <th className="py-2 font-medium">Student</th>
                  <th className="py-2 font-medium">Admission No.</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => (
                  <tr key={r.studentId} className="border-b border-taupe/10">
                    <td className="py-2 text-bistre">{r.name}</td>
                    <td className="py-2 font-mono text-vandyke">{r.admissionNo}</td>
                    <td className="py-2">
                      <div className="flex gap-1.5">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            onClick={() =>
                              setStatuses((prev) => ({ ...prev, [r.studentId]: s.value }))
                            }
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              statuses[r.studentId] === s.value
                                ? s.value === "PRESENT"
                                  ? "bg-status-pass/10 border-status-pass text-status-pass"
                                  : s.value === "LATE"
                                  ? "bg-status-warn/10 border-status-warn text-status-warn"
                                  : "bg-status-fail/10 border-status-fail text-status-fail"
                                : "border-taupe/40 text-vandyke hover:border-choc"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-choc hover:bg-choc-dark disabled:opacity-60 text-antique font-medium rounded-lg px-6 py-2.5 transition-colors"
          >
            {saving ? "Saving…" : "Save attendance"}
          </button>
        </>
      ) : selectedClassId && selectedTermId ? (
        <p className="text-vandyke">No students found in this class.</p>
      ) : null}
    </div>
  );
}
