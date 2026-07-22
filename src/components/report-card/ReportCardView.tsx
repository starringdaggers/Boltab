"use client";

import { RATING_SCALE } from "@/lib/reportCardFields";

type ResultRow = {
  id: string;
  firstHalfScore: number;
  firstHalfObtainable: number;
  secondHalfScore: number;
  secondHalfObtainable: number;
  examScore: number;
  examObtainable: number;
  totalScore: number;
  totalObtainable: number;
  grade: string;
  subject: { name: string };
};

type ReportCardData = {
  timesSchoolOpened: number | null;
  timesPresent: number | null;
  timesAbsent: number | null;
  nextTermBegins: string | null;
  psychomotor: Record<string, number> | null;
  affective: Record<string, number> | null;
  generalPerformance: string | null;
  classTeacherName: string | null;
  classTeacherComment: string | null;
  headmasterComment: string | null;
  dateIssued: string | null;
} | null;

export default function ReportCardView({
  studentName,
  admissionNo,
  className,
  termName,
  academicYear,
  numberOnRoll,
  results,
  reportCard,
  psychomotorLabels,
  affectiveLabels,
}: {
  studentName: string;
  admissionNo: string;
  className: string;
  termName: string;
  academicYear: string;
  numberOnRoll: number;
  results: ResultRow[];
  reportCard: ReportCardData;
  psychomotorLabels: readonly string[];
  affectiveLabels: readonly string[];
}) {
  const totalScore = results.reduce((s, r) => s + r.totalScore, 0);
  const totalObtainable = results.reduce((s, r) => s + r.totalObtainable, 0);

  function RatingTable({ title, labels, values }: { title: string; labels: readonly string[]; values: Record<string, number> | null }) {
    return (
      <div>
        <p className="font-semibold text-bistre text-sm mb-1">{title}</p>
        <table className="w-full text-xs border border-taupe/40 border-collapse">
          <tbody>
            {labels.map((label) => (
              <tr key={label} className="border-b border-taupe/20 last:border-b-0">
                <td className="px-2 py-1 text-vandyke">{label}</td>
                {RATING_SCALE.map((r) => (
                  <td key={r.value} className="px-1.5 py-1 text-center border-l border-taupe/20 w-6">
                    {values?.[label] === r.value ? "✓" : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-white text-bistre border border-taupe/30 rounded-card p-6 sm:p-8 max-w-3xl mx-auto print:border-none print:p-0 print:max-w-none">
      <div className="text-center mb-5 border-b border-taupe/30 pb-4">
        <p className="font-mono text-[10px] tracking-[0.2em] text-vandyke uppercase">
          Boltab Brilliant Schools
        </p>
        <h1 className="font-display text-xl sm:text-2xl font-semibold mt-1 underline underline-offset-4">
          Continuous Assessment for {termName}
        </h1>
        <p className="text-xs text-vandyke mt-1">Academic Year: {academicYear}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-5">
        <p><span className="text-vandyke">Name:</span> {studentName}</p>
        <p><span className="text-vandyke">Admission No.:</span> {admissionNo}</p>
        <p><span className="text-vandyke">Class:</span> {className}</p>
        <p><span className="text-vandyke">Number on Roll:</span> {numberOnRoll}</p>
      </div>

      <div className="mb-5">
        <p className="font-display font-semibold mb-2">1. Attendance (Regularity &amp; Punctuality)</p>
        <table className="w-full text-xs border border-taupe/40 border-collapse">
          <tbody>
            <tr className="border-b border-taupe/20">
              <td className="px-2 py-1 text-vandyke w-1/2">No. of times school opened</td>
              <td className="px-2 py-1">{reportCard?.timesSchoolOpened ?? "—"}</td>
            </tr>
            <tr className="border-b border-taupe/20">
              <td className="px-2 py-1 text-vandyke">No. of times present</td>
              <td className="px-2 py-1">{reportCard?.timesPresent ?? "—"}</td>
            </tr>
            <tr className="border-b border-taupe/20">
              <td className="px-2 py-1 text-vandyke">No. of times absent</td>
              <td className="px-2 py-1">{reportCard?.timesAbsent ?? "—"}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 text-vandyke">Next term begins</td>
              <td className="px-2 py-1">{reportCard?.nextTermBegins ?? "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-5">
        <p className="font-display font-semibold mb-2">2. Cognitive Ability</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-taupe/40 border-collapse">
            <thead>
              <tr className="bg-antique/40">
                <th className="px-2 py-1.5 text-left border border-taupe/30">Subject</th>
                <th className="px-2 py-1.5 border border-taupe/30">1st Half</th>
                <th className="px-2 py-1.5 border border-taupe/30">2nd Half</th>
                <th className="px-2 py-1.5 border border-taupe/30">Examination</th>
                <th className="px-2 py-1.5 border border-taupe/30">Final Result</th>
                <th className="px-2 py-1.5 border border-taupe/30">Performance</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-taupe/20">
                  <td className="px-2 py-1 border border-taupe/20">{r.subject.name}</td>
                  <td className="px-2 py-1 text-center border border-taupe/20">
                    {r.firstHalfScore}/{r.firstHalfObtainable}
                  </td>
                  <td className="px-2 py-1 text-center border border-taupe/20">
                    {r.secondHalfScore}/{r.secondHalfObtainable}
                  </td>
                  <td className="px-2 py-1 text-center border border-taupe/20">
                    {r.examScore}/{r.examObtainable}
                  </td>
                  <td className="px-2 py-1 text-center border border-taupe/20 font-medium">
                    {r.totalScore}/{r.totalObtainable}
                  </td>
                  <td className="px-2 py-1 text-center border border-taupe/20">{r.grade}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-3 text-center text-vandyke">
                    No subject results published yet.
                  </td>
                </tr>
              )}
              {results.length > 0 && (
                <tr className="bg-antique/30 font-semibold">
                  <td className="px-2 py-1 border border-taupe/30">Total</td>
                  <td colSpan={3} className="px-2 py-1 border border-taupe/30"></td>
                  <td className="px-2 py-1 text-center border border-taupe/30">
                    {totalScore}/{totalObtainable}
                  </td>
                  <td className="px-2 py-1 border border-taupe/30"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <RatingTable title="3. Psychomotor Skills" labels={psychomotorLabels} values={reportCard?.psychomotor ?? null} />
        <RatingTable title="4. Affective Areas" labels={affectiveLabels} values={reportCard?.affective ?? null} />
      </div>

      <p className="text-[11px] text-vandyke mb-5">
        Grading scale: 5 - Excellent · 4 - Very Good · 3 - Good · 2 - Fair · 1 - Poor
      </p>

      <div className="text-sm space-y-2 mb-5">
        <p>
          <span className="text-vandyke">General Performance:</span>{" "}
          {reportCard?.generalPerformance || "—"}
        </p>
        <p>
          <span className="text-vandyke">Class Teacher's Comment:</span>{" "}
          {reportCard?.classTeacherComment || "—"}
        </p>
        <p className="text-xs text-vandyke">
          Signature: {reportCard?.classTeacherName || "—"}
        </p>
        <p>
          <span className="text-vandyke">Headmaster/Headmistress's Comment:</span>{" "}
          {reportCard?.headmasterComment || "—"}
        </p>
        {reportCard?.dateIssued && (
          <p className="text-xs text-vandyke">
            Please return this card to the school on {reportCard.dateIssued}.
          </p>
        )}
      </div>

      <div className="flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2 text-sm transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
