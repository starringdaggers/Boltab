"use client";

import { useEffect, useState } from "react";

type Delegation = {
  canManageClasses: boolean;
  canManageSubjects: boolean;
  canManageTerms: boolean;
  canManageStudents: boolean;
  canManageReportCards: boolean;
  canManageAttendance: boolean;
};
type TeacherRow = {
  id: string;
  user: { name: string; email: string };
  delegation: Delegation | null;
};

const PERMISSION_LABELS: { key: keyof Delegation; label: string }[] = [
  { key: "canManageClasses", label: "Classes" },
  { key: "canManageSubjects", label: "Subjects" },
  { key: "canManageTerms", label: "Terms" },
  { key: "canManageStudents", label: "Students" },
  { key: "canManageReportCards", label: "Report Cards" },
  { key: "canManageAttendance", label: "Attendance" },
];

const EMPTY_PERMISSIONS: Delegation = {
  canManageClasses: false,
  canManageSubjects: false,
  canManageTerms: false,
  canManageStudents: false,
  canManageReportCards: false,
  canManageAttendance: false,
};

export default function AdminDelegatesPage() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, Delegation>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/delegations");
    const data = await res.json();
    const list: TeacherRow[] = data.teachers || [];
    setTeachers(list);
    const initial: Record<string, Delegation> = {};
    for (const t of list) {
      initial[t.id] = t.delegation
        ? {
            canManageClasses: t.delegation.canManageClasses,
            canManageSubjects: t.delegation.canManageSubjects,
            canManageTerms: t.delegation.canManageTerms,
            canManageStudents: t.delegation.canManageStudents,
            canManageReportCards: t.delegation.canManageReportCards,
            canManageAttendance: t.delegation.canManageAttendance,
          }
        : { ...EMPTY_PERMISSIONS };
    }
    setDrafts(initial);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function toggle(teacherId: string, key: keyof Delegation) {
    setDrafts((prev) => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], [key]: !prev[teacherId][key] },
    }));
  }

  function setAll(teacherId: string, value: boolean) {
    setDrafts((prev) => ({
      ...prev,
      [teacherId]: {
        canManageClasses: value,
        canManageSubjects: value,
        canManageTerms: value,
        canManageStudents: value,
        canManageReportCards: value,
        canManageAttendance: value,
      },
    }));
  }

  async function handleSave(teacherId: string) {
    setSavingId(teacherId);
    setMessage(null);
    const res = await fetch("/api/admin/delegations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, permissions: drafts[teacherId] }),
    });
    setSavingId(null);
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error);
      return;
    }
    setMessage("Saved.");
    load();
  }

  return (
    <div className="p-10 max-w-4xl">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Delegate Admin Access
      </h1>
      <p className="text-vandyke mb-2">
        Give a teacher access to specific parts of the admin panel, at your
        discretion — they still log in as themselves, this just opens extra
        doors for them.
      </p>
      <p className="text-vandyke text-sm mb-8">
        Not delegable, ever: managing other teachers, school fees, profile
        picture approvals, or this page itself — those always require a real
        admin account, so a delegate can never expand their own access.
      </p>

      {message && (
        <p className="text-sm text-status-pass bg-status-pass/10 border border-status-pass/30 rounded-lg px-3 py-2 mb-4 inline-block">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : teachers.length === 0 ? (
        <p className="text-vandyke">No teacher accounts yet.</p>
      ) : (
        <ul className="space-y-4">
          {teachers.map((t) => {
            const draft = drafts[t.id] || EMPTY_PERMISSIONS;
            const hasAny = Object.values(draft).some(Boolean);
            return (
              <li
                key={t.id}
                className="bg-white/40 border border-taupe/30 rounded-lg px-4 py-4"
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="text-bistre font-medium">{t.user.name}</p>
                    <p className="text-vandyke text-sm">{t.user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAll(t.id, true)}
                      className="text-xs text-choc hover:underline"
                    >
                      Grant all
                    </button>
                    <button
                      onClick={() => setAll(t.id, false)}
                      className="text-xs text-status-fail hover:underline"
                    >
                      Revoke all
                    </button>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        hasAny
                          ? "bg-status-pass/10 text-status-pass"
                          : "bg-taupe/20 text-vandyke"
                      }`}
                    >
                      {hasAny ? "Has delegated access" : "No delegated access"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {PERMISSION_LABELS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => toggle(t.id, p.key)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        draft[p.key]
                          ? "bg-choc/10 border-choc text-choc"
                          : "border-taupe/40 text-vandyke hover:border-choc"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleSave(t.id)}
                  disabled={savingId === t.id}
                  className="text-sm bg-vandyke hover:bg-bistre disabled:opacity-50 text-antique rounded-lg px-4 py-1.5 transition-colors"
                >
                  {savingId === t.id ? "Saving…" : "Save"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
