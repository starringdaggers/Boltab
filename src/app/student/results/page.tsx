"use client";

import { useEffect, useState } from "react";

type Term = { id: string; name: string; academicYear: string };
type ResultRow = {
  id: string;
  testScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remark: string | null;
  subject: { name: string };
};

export default function StudentResultsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const [results, setResults] = useState<ResultRow[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    async function loadResults() {
      if (!selectedTermId) return;
      setLoadingResults(true);
      setError(null);
      const res = await fetch(`/api/student/results?termId=${selectedTermId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setResults([]);
        setAverage(null);
      } else {
        setResults(data.results);
        setAverage(data.average);
      }
      setLoadingResults(false);
    }
    loadResults();
  }, [selectedTermId]);

  return (
    <div className="p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        My Results
      </h1>
      <p className="text-vandyke mb-8">
        Select a term to see your scores by subject.
      </p>

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

      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}

      {loadingResults ? (
        <p className="text-vandyke">Loading results…</p>
      ) : results.length === 0 && selectedTermId ? (
        <p className="text-vandyke">
          No results have been published for you this term yet.
        </p>
      ) : results.length > 0 ? (
        <>
          {average !== null && (
            <div className="bg-white/40 border border-taupe/30 rounded-card p-5 mb-6 max-w-xs">
              <p className="font-mono text-xs tracking-wide text-vandyke uppercase mb-1">
                Term average
              </p>
              <p className="font-display text-3xl text-bistre font-semibold">
                {average.toFixed(1)}
              </p>
            </div>
          )}

          <div className="overflow-x-auto max-w-3xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-vandyke border-b border-taupe/30">
                  <th className="py-2 font-medium">Subject</th>
                  <th className="py-2 font-medium">Test</th>
                  <th className="py-2 font-medium">Exam</th>
                  <th className="py-2 font-medium">Total</th>
                  <th className="py-2 font-medium">Grade</th>
                  <th className="py-2 font-medium">Remark</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-taupe/10">
                    <td className="py-2 text-bistre">{r.subject.name}</td>
                    <td className="py-2 font-mono text-vandyke">{r.testScore}</td>
                    <td className="py-2 font-mono text-vandyke">{r.examScore}</td>
                    <td className="py-2 font-mono text-vandyke">{r.totalScore}</td>
                    <td className="py-2">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.grade === "F"
                            ? "bg-status-fail/10 text-status-fail"
                            : r.grade === "D" || r.grade === "E"
                            ? "bg-status-warn/10 text-status-warn"
                            : "bg-status-pass/10 text-status-pass"
                        }`}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-2 text-vandyke">{r.remark || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
