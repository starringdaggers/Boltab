"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Avatar from "@/components/shared/Avatar";

type Profile = {
  id: string;
  name: string;
  email: string;
  profilePictureUrl: string | null;
  admissionNo: string;
  class: { id: string; name: string };
  dateOfBirth: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
};
type HistoryRow = {
  term: { id: string; name: string; academicYear: string };
  subjectCount: number;
  average: number | null;
  attendancePercent: number | null;
  weightKg: number | null;
  heightCm: number | null;
  generalPerformance: string | null;
};

function ageFromDOB(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

export default function AdminStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ guardianName: "", guardianPhone: "", dateOfBirth: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/students/${studentId}`);
    const data = await res.json();
    if (res.ok) {
      setProfile(data.student);
      setHistory(data.history);
      setForm({
        guardianName: data.student.guardianName || "",
        guardianPhone: data.student.guardianPhone || "",
        dateOfBirth: data.student.dateOfBirth ? data.student.dateOfBirth.slice(0, 10) : "",
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    if (studentId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error);
      return;
    }
    setEditing(false);
    load();
  }

  if (loading) return <div className="p-10 text-vandyke">Loading…</div>;
  if (!profile) return <div className="p-10 text-status-fail">Student not found.</div>;

  const age = ageFromDOB(profile.dateOfBirth);

  return (
    <div className="p-10 max-w-4xl">
      <button
        onClick={() => router.push("/admin/students")}
        className="text-sm text-vandyke hover:text-bistre mb-4"
      >
        ← Back to Students
      </button>

      <div className="flex items-center gap-4 mb-8">
        <Avatar name={profile.name} size={64} imageUrl={profile.profilePictureUrl} />
        <div>
          <h1 className="font-display text-2xl text-bistre font-semibold">{profile.name}</h1>
          <p className="text-vandyke text-sm">
            {profile.class.name} · {profile.admissionNo} · {profile.email}
          </p>
        </div>
      </div>

      {/* Permanent bio record */}
      <div className="bg-white/40 border border-taupe/30 rounded-card p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-bistre font-semibold">Student Record</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-choc hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-xs text-vandyke mb-1">Date of birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-vandyke mb-1">Parent/Guardian name</label>
              <input
                value={form.guardianName}
                onChange={(e) => setForm((p) => ({ ...p, guardianName: e.target.value }))}
                className="w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-vandyke mb-1">Parent/Guardian phone</label>
              <input
                value={form.guardianPhone}
                onChange={(e) => setForm((p) => ({ ...p, guardianPhone: e.target.value }))}
                className="w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
              />
            </div>
            {message && <p className="text-status-fail text-sm">{message}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-choc hover:bg-choc-dark disabled:opacity-50 text-antique rounded-lg px-4 py-2 text-sm transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-sm text-vandyke hover:text-bistre"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm max-w-md">
            <div>
              <span className="text-vandyke">Date of birth: </span>
              <span className="text-bistre">
                {profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString()
                  : "Not set"}
              </span>
            </div>
            <div>
              <span className="text-vandyke">Age: </span>
              <span className="text-bistre">{age !== null ? `${age} years` : "—"}</span>
            </div>
            <div>
              <span className="text-vandyke">Guardian: </span>
              <span className="text-bistre">{profile.guardianName || "Not set"}</span>
            </div>
            <div>
              <span className="text-vandyke">Guardian phone: </span>
              <span className="text-bistre">{profile.guardianPhone || "Not set"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Permanent per-term history — nothing here ever gets deleted on term rollover */}
      <h2 className="font-display text-lg text-bistre font-semibold mb-3">
        Full Academic History
      </h2>
      <p className="text-vandyke text-sm mb-4">
        Every term this student has any record for — permanently retained,
        even after they've moved to a new class.
      </p>

      {history.length === 0 ? (
        <p className="text-vandyke">No records yet for this student.</p>
      ) : (
        <div className="space-y-3">
          {history.map((h) => (
            <div
              key={h.term.id}
              className="bg-white/40 border border-taupe/30 rounded-lg px-4 py-3"
            >
              <p className="text-bistre font-medium mb-2">
                {h.term.name} — {h.term.academicYear}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-vandyke uppercase tracking-wide">Subjects</p>
                  <p className="text-bistre font-mono">{h.subjectCount}</p>
                </div>
                <div>
                  <p className="text-xs text-vandyke uppercase tracking-wide">Average</p>
                  <p className="text-bistre font-mono">
                    {h.average !== null ? h.average.toFixed(1) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-vandyke uppercase tracking-wide">Attendance</p>
                  <p className="text-bistre font-mono">
                    {h.attendancePercent !== null ? `${h.attendancePercent}%` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-vandyke uppercase tracking-wide">Weight / Height</p>
                  <p className="text-bistre font-mono">
                    {h.weightKg !== null ? `${h.weightKg}kg` : "—"} /{" "}
                    {h.heightCm !== null ? `${h.heightCm}cm` : "—"}
                  </p>
                </div>
              </div>
              {h.generalPerformance && (
                <p className="text-sm text-vandyke mt-2">
                  <span className="text-xs uppercase tracking-wide">General performance: </span>
                  {h.generalPerformance}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
