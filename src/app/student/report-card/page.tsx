"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReportCardView from "@/components/report-card/ReportCardView";

type Term = { id: string; name: string; academicYear: string };

export default function StudentReportCardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-vandyke">Loading…</div>}>
      <StudentReportCardContent />
    </Suspense>
  );
}

function StudentReportCardContent() {
  const searchParams = useSearchParams();
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState(searchParams.get("termId") || "");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTerms() {
      const res = await fetch("/api/student/terms");
      const d = await res.json();
      const termList: Term[] = d.terms || [];
      setTerms(termList);
      if (!selectedTermId && termList.length > 0) setSelectedTermId(termList[0].id);
    }
    loadTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!selectedTermId) return;
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/student/report-card?termId=${selectedTermId}`);
      const d = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(d.error);
        setData(null);
        return;
      }
      setData(d);
    }
    loadData();
  }, [selectedTermId]);

  return (
    <div className="p-10">
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between flex-wrap gap-3 print:hidden">
        <h1 className="font-display text-3xl text-bistre font-semibold">Report Card</h1>
        {terms.length > 0 && (
          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
          >
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.academicYear}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="text-status-fail text-sm mb-4 max-w-3xl mx-auto">{error}</p>}
      {loading && <p className="text-vandyke max-w-3xl mx-auto">Loading…</p>}

      {data && !loading && (
        <ReportCardView
          studentName={data.student.name}
          admissionNo={data.student.admissionNo}
          className={data.student.className}
          termName={data.term.name}
          academicYear={data.term.academicYear}
          numberOnRoll={data.numberOnRoll}
          results={data.results}
          reportCard={data.reportCard}
          psychomotorLabels={data.fields.psychomotor}
          affectiveLabels={data.fields.affective}
        />
      )}
    </div>
  );
}
