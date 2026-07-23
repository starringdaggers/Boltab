"use client";

import { useEffect, useState } from "react";

type Option = { id: string; name: string };
type Term = { id: string; name: string; academicYear: string; resultsReleased: boolean };
type RosterEntry = { studentId: string; name: string; admissionNo: string; isWithheld: boolean };

export default function AdminReportCardsPage() {
  const [classes, setClasses] = useState<Option[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [termInfo, setTermInfo] = useState<Term | null>(null);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [classesRes, termsRes] = await Promise.all([
          fetch("/api/admin/classes"),
          fetch("/api/admin/terms"),
        ]);
        setClasses((await classesRes.json()).classes || []);
        setTerms((await termsRes.json()).terms || []);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadRoster() {
      if (!selectedClassId || !selectedTermId) {
        setRoster([]);
        setTermInfo(null);
        return;
      }
      setLoadingRoster(true);
      setError(null);
      try {
        const params = new URLSearchParams({ classId: selectedClassId, termId: selectedTermId });
        const res = await fetch(`/api/admin/report-cards?${params}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Couldn't load the roster.");
          setRoster([]);
          setTermInfo(null);
          return;
        }
        setRoster(data.roster || []);
        setTermInfo(data.term);
      } catch {
        setError("Couldn't reach the server. Check your connection and try again.");
      } finally {
        setLoadingRoster(false);
      }
    }
    loadRoster();
  }, [selectedClassId, selectedTermId]);

  async function toggleWithhold(entry: RosterEntry) {
    setSavingId(entry.studentId);
    try {
      const res = await fetch("/api/admin/report-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: entry.studentId,
          termId: selectedTermId,
          isWithheld: !entry.isWithheld,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Couldn't update this student.");
        return;
      }
      setRoster((prev) =>
        prev.map((r) =>
          r.studentId === entry.studentId ? { ...r, isWithheld: !r.isWithheld } : r
        )
      );
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-3xl">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Report Cards
      </h1>
      <p className="text-vandyke mb-6">
        Even after a term's results are released, you can withhold an
        individual student's report card here — useful for outstanding fees
        or other holds.
      </p>

      {loadingOptions ? (
        <p className="text-vandyke">Loading…</p>
      ) : (
        <div className="flex flex-wrap gap-3 mb-6 max-w-xl">
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
                {t.name} — {t.academicYear} {t.resultsReleased ? "(Released)" : "(Not released)"}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}

      {termInfo && (
        <p
          className={`text-sm mb-4 px-3 py-2 rounded-lg border inline-block ${
            termInfo.resultsReleased
              ? "text-status-pass bg-status-pass/10 border-status-pass/30"
              : "text-vandyke bg-taupe/10 border-taupe/30"
          }`}
        >
          {termInfo.resultsReleased
            ? "This term's results are released to students — withheld students below still won't see theirs."
            : "This term's results aren't released yet — no student in this class can see results, regardless of the toggles below."}
        </p>
      )}

      {loadingRoster ? (
        <p className="text-vandyke">Loading roster…</p>
      ) : roster.length > 0 ? (
        <ul className="space-y-2">
          {roster.map((r) => (
            <li
              key={r.studentId}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white/40 border border-taupe/30 rounded-lg px-4 py-3"
            >
              <div>
                <span className="text-bistre font-medium">{r.name}</span>
                <span className="text-vandyke text-sm font-mono ml-2">{r.admissionNo}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    r.isWithheld
                      ? "bg-status-fail/10 text-status-fail"
                      : "bg-status-pass/10 text-status-pass"
                  }`}
                >
                  {r.isWithheld ? "Withheld" : "Visible"}
                </span>
                <button
                  onClick={() => toggleWithhold(r)}
                  disabled={savingId === r.studentId}
                  className="text-sm text-vandyke hover:text-bistre disabled:opacity-50 whitespace-nowrap"
                >
                  {savingId === r.studentId ? "Saving…" : r.isWithheld ? "Release to student" : "Withhold"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : selectedClassId && selectedTermId ? (
        <p className="text-vandyke">No students found in this class.</p>
      ) : null}
    </div>
  );
}
