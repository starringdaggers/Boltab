"use client";

import { useEffect, useState } from "react";

type Assignment = {
  id: string;
  class: { id: string; name: string };
  subject: { id: string; name: string };
};
type TeacherRow = {
  id: string;
  user: { id: string; name: string; email: string };
  assignments: Assignment[];
};
type Option = { id: string; name: string };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newCredentials, setNewCredentials] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);

  // Per-teacher assignment form state, keyed by teacher id
  const [assignForm, setAssignForm] = useState<
    Record<string, { classId: string; subjectId: string }>
  >({});

  async function load() {
    setLoading(true);
    const [teachersRes, classesRes, subjectsRes] = await Promise.all([
      fetch("/api/admin/teachers"),
      fetch("/api/admin/classes"),
      fetch("/api/admin/subjects"),
    ]);
    const teachersData = await teachersRes.json();
    const classesData = await classesRes.json();
    const subjectsData = await subjectsRes.json();
    setTeachers(teachersData.teachers || []);
    setClasses(classesData.classes || []);
    setSubjects(subjectsData.subjects || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNewCredentials(null);
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setNewCredentials({ email: data.user.email, tempPassword: data.tempPassword });
    setName("");
    setEmail("");
    load();
  }

  async function handleAssign(teacherId: string) {
    const form = assignForm[teacherId];
    if (!form?.classId || !form?.subjectId) return;
    const res = await fetch(`/api/admin/teachers/${teacherId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    setAssignForm((prev) => ({ ...prev, [teacherId]: { classId: "", subjectId: "" } }));
    load();
  }

  async function handleUnassign(teacherId: string, assignmentId: string) {
    await fetch(`/api/admin/teachers/${teacherId}/assignments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId }),
    });
    load();
  }

  return (
    <div className="p-10 max-w-3xl">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Teachers
      </h1>
      <p className="text-vandyke mb-8">
        Create a teacher account, then assign the classes and subjects
        they're allowed to enter results for.
      </p>

      <form onSubmit={handleCreate} className="flex gap-3 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="flex-1 border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 focus:border-choc outline-none"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="flex-1 border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 focus:border-choc outline-none"
        />
        <button
          type="submit"
          className="bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2 transition-colors whitespace-nowrap"
        >
          Add teacher
        </button>
      </form>
      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}
      {newCredentials && (
        <div className="bg-status-pass/10 border border-status-pass/30 rounded-lg px-4 py-3 mb-8 text-sm">
          <p className="text-bistre font-medium mb-1">
            Account created — share these credentials with the teacher now.
            This password won't be shown again.
          </p>
          <p className="font-mono text-vandyke">
            {newCredentials.email} / {newCredentials.tempPassword}
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : teachers.length === 0 ? (
        <p className="text-vandyke">No teachers yet — add your first one above.</p>
      ) : (
        <ul className="space-y-4">
          {teachers.map((t) => (
            <li
              key={t.id}
              className="bg-white/40 border border-taupe/30 rounded-lg px-4 py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-bistre font-medium">{t.user.name}</p>
                  <p className="text-vandyke text-sm">{t.user.email}</p>
                </div>
              </div>

              {t.assignments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {t.assignments.map((a) => (
                    <span
                      key={a.id}
                      className="text-xs bg-taupe/20 text-vandyke rounded-full px-3 py-1 flex items-center gap-2"
                    >
                      {a.class.name} · {a.subject.name}
                      <button
                        onClick={() => handleUnassign(t.id, a.id)}
                        className="text-status-fail"
                        aria-label="Remove assignment"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <select
                  value={assignForm[t.id]?.classId || ""}
                  onChange={(e) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      [t.id]: { ...prev[t.id], classId: e.target.value, subjectId: prev[t.id]?.subjectId || "" },
                    }))
                  }
                  className="border border-taupe/50 rounded-lg px-2 py-1.5 bg-white/60 text-sm"
                >
                  <option value="">Class…</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={assignForm[t.id]?.subjectId || ""}
                  onChange={(e) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      [t.id]: { ...prev[t.id], subjectId: e.target.value, classId: prev[t.id]?.classId || "" },
                    }))
                  }
                  className="border border-taupe/50 rounded-lg px-2 py-1.5 bg-white/60 text-sm"
                >
                  <option value="">Subject…</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(t.id)}
                  className="text-sm bg-vandyke hover:bg-bistre text-antique rounded-lg px-4 py-1.5 transition-colors"
                >
                  Assign
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
