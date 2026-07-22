"use client";

import { useEffect, useMemo, useState } from "react";

type Option = { id: string; name: string };
type Assignment = {
  id: string;
  class: { id: string; name: string };
  subject: { id: string; name: string };
};
type Term = { id: string; name: string; academicYear: string; isLocked: boolean };
type RosterEntry = {
  studentId: string;
  name: string;
  admissionNo: string;
  existingResult: {
    testScore: number;
    examScore: number;
    remark: string | null;
  } | null;
};

const MAX_TEST = 40;
const MAX_EXAM = 60;

function computeGradeClient(total: number): string {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

export default function TeacherResultsPage() {
  const [classes, setClasses] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");

  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [scores, setScores] = useState<
    Record<string, { testScore: string; examScore: string; remark: string }>
  >({});

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      const [classesRes, subjectsRes, assignmentsRes, termsRes] = await Promise.all([
        fetch("/api/teacher/classes"),
        fetch("/api/teacher/subjects"),
        fetch("/api/teacher/assignments"),
        fetch("/api/teacher/terms"),
      ]);
      setClasses((await classesRes.json()).classes || []);
      setSubjects((await subjectsRes.json()).subjects || []);
      setAssignments((await assignmentsRes.json()).assignments || []);
      setTerms((await termsRes.json()).terms || []);
      setLoadingOptions(false);
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadRoster() {
      if (!selectedClassId || !selectedSubjectId || !selectedTermId) {
        setRoster([]);
        return;
      }
      setLoadingRoster(true);
      setMessage(null);
      const params = new URLSearchParams({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        termId: selectedTermId,
      });
      const res = await fetch(`/api/teacher/results?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        setRoster([]);
        setLoadingRoster(false);
        return;
      }
      setRoster(data.roster);
      setIsLocked(data.isLocked);

      const initialScores: typeof scores = {};
      for (const entry of data.roster as RosterEntry[]) {
        initialScores[entry.studentId] = {
          testScore: entry.existingResult ? String(entry.existingResult.testScore) : "",
          examScore: entry.existingResult ? String(entry.existingResult.examScore) : "",
          remark: entry.existingResult?.remark || "",
        };
      }
      setScores(initialScores);
      setLoadingRoster(false);
    }
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, selectedSubjectId, selectedTermId]);

  function updateScore(studentId: string, field: "testScore" | "examScore" | "remark", value: string) {
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  }

  function applyShortcut(a: Assignment) {
    setSelectedClassId(a.class.id);
    setSelectedSubjectId(a.subject.id);
  }

  async function handleSubmit() {
    if (!selectedClassId || !selectedSubjectId || !selectedTermId) return;
    setMessage(null);

    const entries = roster
      .map((r) => {
        const s = scores[r.studentId];
        if (!s || s.testScore === "" || s.examScore === "") return null;
        return {
          studentId: r.studentId,
          testScore: Number(s.testScore),
          examScore: Number(s.examScore),
          remark: s.remark || undefined,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    if (entries.length === 0) {
      setMessage({ type: "error", text: "Enter at least one student's scores before saving." });
      return;
    }

    setSaving(true);
    const res = await fetch("/api/teacher/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        termId: selectedTermId,
        entries,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error });
      return;
    }
    setMessage({ type: "success", text: `Saved results for ${data.saved} student(s).` });
  }

  return (
    <div className="p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Enter Results
      </h1>
      <p className="text-vandyke mb-6">
        Pick a class, subject, and term, then enter scores for the whole
        class at once.
      </p>

      {assignments.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-vandyke uppercase tracking-wide font-mono mb-2">
            Quick picks — your usual classes
          </p>
          <div className="flex flex-wrap gap-2">
            {assignments.map((a) => (
              <button
                key={a.id}
                onClick={() => applyShortcut(a)}
                className="text-xs bg-taupe/20 hover:bg-taupe/30 text-vandyke rounded-full px-3 py-1.5 transition-colors"
              >
                {a.class.name} · {a.subject.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="flex-1 min-w-[160px] border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
          >
            <option value="">Select subject…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
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
                {t.name} — {t.academicYear} {t.isLocked ? "(Locked)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {message && (
        <p
          className={`text-sm mb-4 px-3 py-2 rounded-lg border ${
            message.type === "success"
              ? "text-status-pass bg-status-pass/10 border-status-pass/30"
              : "text-status-fail bg-status-fail/10 border-status-fail/30"
          }`}
        >
          {message.text}
        </p>
      )}

      {isLocked && roster.length > 0 && (
        <p className="text-sm mb-4 px-3 py-2 rounded-lg border text-status-fail bg-status-fail/10 border-status-fail/30">
          This term is locked by the admin — you can view scores but can't
          edit them.
        </p>
      )}

      {loadingRoster ? (
        <p className="text-vandyke">Loading roster…</p>
      ) : roster.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="text-left text-vandyke border-b border-taupe/30">
                  <th className="py-2 font-medium">Student</th>
                  <th className="py-2 font-medium">Admission No.</th>
                  <th className="py-2 font-medium w-24">
                    Test (/{MAX_TEST})
                  </th>
                  <th className="py-2 font-medium w-24">
                    Exam (/{MAX_EXAM})
                  </th>
                  <th className="py-2 font-medium w-20">Total</th>
                  <th className="py-2 font-medium w-16">Grade</th>
                  <th className="py-2 font-medium">Remark</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => {
                  const s = scores[r.studentId] || { testScore: "", examScore: "", remark: "" };
                  const test = Number(s.testScore) || 0;
                  const exam = Number(s.examScore) || 0;
                  const hasScores = s.testScore !== "" && s.examScore !== "";
                  const total = test + exam;
                  return (
                    <tr key={r.studentId} className="border-b border-taupe/10">
                      <td className="py-2 text-bistre">{r.name}</td>
                      <td className="py-2 font-mono text-vandyke">{r.admissionNo}</td>
                      <td className="py-2">
                        <input
                          type="number"
                          min={0}
                          max={MAX_TEST}
                          disabled={isLocked}
                          value={s.testScore}
                          onChange={(e) => updateScore(r.studentId, "testScore", e.target.value)}
                          className="w-16 border border-taupe/50 rounded px-2 py-1 bg-white/60 disabled:opacity-50"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          min={0}
                          max={MAX_EXAM}
                          disabled={isLocked}
                          value={s.examScore}
                          onChange={(e) => updateScore(r.studentId, "examScore", e.target.value)}
                          className="w-16 border border-taupe/50 rounded px-2 py-1 bg-white/60 disabled:opacity-50"
                        />
                      </td>
                      <td className="py-2 font-mono text-vandyke">
                        {hasScores ? total : "—"}
                      </td>
                      <td className="py-2 font-mono text-vandyke">
                        {hasScores ? computeGradeClient(total) : "—"}
                      </td>
                      <td className="py-2">
                        <input
                          type="text"
                          disabled={isLocked}
                          value={s.remark}
                          onChange={(e) => updateScore(r.studentId, "remark", e.target.value)}
                          placeholder="Optional"
                          className="w-full border border-taupe/50 rounded px-2 py-1 bg-white/60 disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!isLocked && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-choc hover:bg-choc-dark disabled:opacity-60 text-antique font-medium rounded-lg px-6 py-2.5 transition-colors"
            >
              {saving ? "Saving…" : "Save results"}
            </button>
          )}
        </>
      ) : selectedClassId && selectedSubjectId && selectedTermId ? (
        <p className="text-vandyke">No students found in this class.</p>
      ) : null}
    </div>
  );
}
