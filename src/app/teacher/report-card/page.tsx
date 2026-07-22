"use client";

import { useEffect, useState } from "react";
import { PSYCHOMOTOR_SKILLS, AFFECTIVE_TRAITS, RATING_SCALE } from "@/lib/reportCardFields";

type Option = { id: string; name: string };
type Term = { id: string; name: string; academicYear: string; isLocked: boolean };
type RosterEntry = { studentId: string; name: string; admissionNo: string; started: boolean };
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

const EMPTY_FORM = {
  timesSchoolOpened: "",
  timesPresent: "",
  timesAbsent: "",
  nextTermBegins: "",
  generalPerformance: "",
  classTeacherName: "",
  classTeacherComment: "",
  headmasterComment: "",
  dateIssued: "",
};

export default function TeacherReportCardPage() {
  const [classes, setClasses] = useState<Option[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [numberOnRoll, setNumberOnRoll] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [psychomotor, setPsychomotor] = useState<Record<string, number>>({});
  const [affective, setAffective] = useState<Record<string, number>>({});

  const [loadingRoster, setLoadingRoster] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadOptions() {
      const [classesRes, termsRes] = await Promise.all([
        fetch("/api/teacher/classes"),
        fetch("/api/teacher/terms"),
      ]);
      setClasses((await classesRes.json()).classes || []);
      setTerms((await termsRes.json()).terms || []);
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadRoster() {
      setSelectedStudentId("");
      if (!selectedClassId || !selectedTermId) {
        setRoster([]);
        return;
      }
      setLoadingRoster(true);
      const params = new URLSearchParams({ classId: selectedClassId, termId: selectedTermId });
      const res = await fetch(`/api/teacher/report-card?${params}`);
      const data = await res.json();
      setLoadingRoster(false);
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }
      setRoster(data.roster || []);
      setNumberOnRoll(data.numberOnRoll || 0);
      setIsLocked(data.isLocked);
    }
    loadRoster();
  }, [selectedClassId, selectedTermId]);

  useEffect(() => {
    async function loadStudent() {
      if (!selectedClassId || !selectedTermId || !selectedStudentId) return;
      setLoadingStudent(true);
      setMessage(null);
      const params = new URLSearchParams({
        classId: selectedClassId,
        termId: selectedTermId,
        studentId: selectedStudentId,
      });
      const res = await fetch(`/api/teacher/report-card?${params}`);
      const data = await res.json();
      setLoadingStudent(false);
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }
      const rc: ReportCardData = data.reportCard;
      setForm({
        timesSchoolOpened: rc?.timesSchoolOpened != null ? String(rc.timesSchoolOpened) : "",
        timesPresent: rc?.timesPresent != null ? String(rc.timesPresent) : "",
        timesAbsent: rc?.timesAbsent != null ? String(rc.timesAbsent) : "",
        nextTermBegins: rc?.nextTermBegins || "",
        generalPerformance: rc?.generalPerformance || "",
        classTeacherName: rc?.classTeacherName || "",
        classTeacherComment: rc?.classTeacherComment || "",
        headmasterComment: rc?.headmasterComment || "",
        dateIssued: rc?.dateIssued || "",
      });
      setPsychomotor(rc?.psychomotor || {});
      setAffective(rc?.affective || {});
    }
    loadStudent();
  }, [selectedStudentId, selectedClassId, selectedTermId]);

  function updateForm(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!selectedStudentId || !selectedTermId) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/teacher/report-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: selectedStudentId,
        termId: selectedTermId,
        timesSchoolOpened: form.timesSchoolOpened === "" ? null : Number(form.timesSchoolOpened),
        timesPresent: form.timesPresent === "" ? null : Number(form.timesPresent),
        timesAbsent: form.timesAbsent === "" ? null : Number(form.timesAbsent),
        nextTermBegins: form.nextTermBegins || null,
        psychomotor,
        affective,
        generalPerformance: form.generalPerformance || null,
        classTeacherName: form.classTeacherName || null,
        classTeacherComment: form.classTeacherComment || null,
        headmasterComment: form.headmasterComment || null,
        dateIssued: form.dateIssued || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error });
      return;
    }
    setMessage({ type: "success", text: "Report card details saved." });
    setRoster((prev) =>
      prev.map((r) => (r.studentId === selectedStudentId ? { ...r, started: true } : r))
    );
  }

  function RatingGrid({
    title,
    labels,
    values,
    onChange,
  }: {
    title: string;
    labels: readonly string[];
    values: Record<string, number>;
    onChange: (label: string, value: number) => void;
  }) {
    return (
      <div className="mb-6">
        <p className="font-display text-lg text-bistre font-semibold mb-2">{title}</p>
        <div className="border border-taupe/30 rounded-card overflow-hidden">
          {labels.map((label, i) => (
            <div
              key={label}
              className={`flex items-center justify-between px-4 py-2 text-sm ${
                i % 2 === 0 ? "bg-white/40" : "bg-white/20"
              }`}
            >
              <span className="text-vandyke">{label}</span>
              <div className="flex gap-3">
                {RATING_SCALE.map((r) => (
                  <label key={r.value} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={label}
                      disabled={isLocked}
                      checked={values[label] === r.value}
                      onChange={() => onChange(label, r.value)}
                    />
                    <span className="text-xs text-vandyke">{r.value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-4xl">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Report Card Details
      </h1>
      <p className="text-vandyke mb-6">
        Attendance, psychomotor & affective ratings, and comments — the parts
        of the report card that aren't tied to a single subject.
      </p>

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
              {t.name} — {t.academicYear} {t.isLocked ? "(Locked)" : ""}
            </option>
          ))}
        </select>
      </div>

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

      {loadingRoster ? (
        <p className="text-vandyke">Loading roster…</p>
      ) : roster.length > 0 ? (
        <div className="mb-6 max-w-2xl">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
          >
            <option value="">Select student…</option>
            {roster.map((r) => (
              <option key={r.studentId} value={r.studentId}>
                {r.name} ({r.admissionNo}) {r.started ? "✓" : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-vandyke mt-2 font-mono">
            Number on roll (this class): {numberOnRoll}
          </p>
        </div>
      ) : selectedClassId && selectedTermId ? (
        <p className="text-vandyke mb-6">No students found in this class.</p>
      ) : null}

      {isLocked && selectedStudentId && (
        <p className="text-sm mb-4 px-3 py-2 rounded-lg border text-status-fail bg-status-fail/10 border-status-fail/30">
          This term is locked by the admin — you can view details but can't
          edit them.
        </p>
      )}

      {loadingStudent ? (
        <p className="text-vandyke">Loading…</p>
      ) : selectedStudentId ? (
        <>
          <div className="mb-6">
            <p className="font-display text-lg text-bistre font-semibold mb-2">1. Attendance</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="text-xs text-vandyke">
                No. of times school opened
                <input
                  type="number"
                  min={0}
                  disabled={isLocked}
                  value={form.timesSchoolOpened}
                  onChange={(e) => updateForm("timesSchoolOpened", e.target.value)}
                  className="mt-1 w-full border border-taupe/50 rounded px-2 py-1.5 bg-white/60 disabled:opacity-50"
                />
              </label>
              <label className="text-xs text-vandyke">
                No. of times present
                <input
                  type="number"
                  min={0}
                  disabled={isLocked}
                  value={form.timesPresent}
                  onChange={(e) => updateForm("timesPresent", e.target.value)}
                  className="mt-1 w-full border border-taupe/50 rounded px-2 py-1.5 bg-white/60 disabled:opacity-50"
                />
              </label>
              <label className="text-xs text-vandyke">
                No. of times absent
                <input
                  type="number"
                  min={0}
                  disabled={isLocked}
                  value={form.timesAbsent}
                  onChange={(e) => updateForm("timesAbsent", e.target.value)}
                  className="mt-1 w-full border border-taupe/50 rounded px-2 py-1.5 bg-white/60 disabled:opacity-50"
                />
              </label>
              <label className="text-xs text-vandyke">
                Next term begins
                <input
                  type="text"
                  placeholder="e.g. 14th September, 2026"
                  disabled={isLocked}
                  value={form.nextTermBegins}
                  onChange={(e) => updateForm("nextTermBegins", e.target.value)}
                  className="mt-1 w-full border border-taupe/50 rounded px-2 py-1.5 bg-white/60 disabled:opacity-50"
                />
              </label>
            </div>
          </div>

          <RatingGrid
            title="3. Psychomotor Skills"
            labels={PSYCHOMOTOR_SKILLS}
            values={psychomotor}
            onChange={(label, value) =>
              setPsychomotor((prev) => ({ ...prev, [label]: value }))
            }
          />

          <RatingGrid
            title="4. Affective Areas"
            labels={AFFECTIVE_TRAITS}
            values={affective}
            onChange={(label, value) => setAffective((prev) => ({ ...prev, [label]: value }))}
          />

          <div className="mb-6 grid gap-3 max-w-xl">
            <label className="text-xs text-vandyke">
              General performance
              <input
                type="text"
                placeholder="e.g. Satisfactory"
                disabled={isLocked}
                value={form.generalPerformance}
                onChange={(e) => updateForm("generalPerformance", e.target.value)}
                className="mt-1 w-full border border-taupe/50 rounded px-2 py-1.5 bg-white/60 disabled:opacity-50"
              />
            </label>
            <label className="text-xs text-vandyke">
              Class teacher's name
              <input
                type="text"
                disabled={isLocked}
                value={form.classTeacherName}
                onChange={(e) => updateForm("classTeacherName", e.target.value)}
                className="mt-1 w-full border border-taupe/50 rounded px-2 py-1.5 bg-white/60 disabled:opacity-50"
              />
            </label>
            <label className="text-xs text-vandyke">
              Class teacher's comment
              <textarea
                rows={2}
                disabled={isLocked}
                value={form.classTeacherComment}
                onChange={(e) => updateForm("classTeacherComment", e.target.value)}
                className="mt-1 w-full border border-taupe/50 rounded px-2 py-1.5 bg-white/60 disabled:opacity-50"
              />
            </label>
            <label className="text-xs text-vandyke">
              Headmaster/Headmistress's comment
              <textarea
                rows={2}
                disabled={isLocked}
                value={form.headmasterComment}
                onChange={(e) => updateForm("headmasterComment", e.target.value)}
                className="mt-1 w-full border border-taupe/50 rounded px-2 py-1.5 bg-white/60 disabled:opacity-50"
              />
            </label>
            <label className="text-xs text-vandyke">
              Return this card to school on
              <input
                type="text"
                placeholder="e.g. 14th September, 2026"
                disabled={isLocked}
                value={form.dateIssued}
                onChange={(e) => updateForm("dateIssued", e.target.value)}
                className="mt-1 w-full border border-taupe/50 rounded px-2 py-1.5 bg-white/60 disabled:opacity-50"
              />
            </label>
          </div>

          {!isLocked && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-choc hover:bg-choc-dark disabled:opacity-60 text-antique font-medium rounded-lg px-6 py-2.5 transition-colors"
            >
              {saving ? "Saving…" : "Save report card details"}
            </button>
          )}
        </>
      ) : null}
    </div>
  );
}
