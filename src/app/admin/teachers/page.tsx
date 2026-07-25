"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import Pagination from "@/components/shared/Pagination";

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

  // Per-teacher "assign" form state, keyed by teacher id: chosen class + which subject checkboxes are ticked
  const [assignForm, setAssignForm] = useState<
    Record<string, { classId: string; subjectIds: Set<string> }>
  >({});
  const [assigning, setAssigning] = useState<string | null>(null);

  // Per-teacher bulk-delete selection state: which existing assignment chips are checked
  const [selectedForRemoval, setSelectedForRemoval] = useState<
    Record<string, Set<string>>
  >({});
  const [removing, setRemoving] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

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
    const subjectIds = Array.from(form?.subjectIds || []);
    if (!form?.classId || subjectIds.length === 0) return;
    setAssigning(teacherId);
    const res = await fetch(`/api/admin/teachers/${teacherId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: form.classId, subjectIds }),
    });
    const data = await res.json();
    setAssigning(null);
    if (!res.ok) {
      alert(data.error);
      return;
    }
    if (typeof data.created === "number") {
      alert(`Assigned ${data.created} subject(s) for this class.`);
    }
    setAssignForm((prev) => ({ ...prev, [teacherId]: { classId: form.classId, subjectIds: new Set() } }));
    load();
  }

  function toggleSubjectCheckbox(teacherId: string, subjectId: string) {
    setAssignForm((prev) => {
      const current = prev[teacherId] || { classId: "", subjectIds: new Set<string>() };
      const next = new Set(current.subjectIds);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return { ...prev, [teacherId]: { ...current, subjectIds: next } };
    });
  }

  function toggleSelectAllSubjects(teacherId: string) {
    setAssignForm((prev) => {
      const current = prev[teacherId] || { classId: "", subjectIds: new Set<string>() };
      const allSelected = subjects.every((s) => current.subjectIds.has(s.id));
      const next = allSelected ? new Set<string>() : new Set(subjects.map((s) => s.id));
      return { ...prev, [teacherId]: { ...current, subjectIds: next } };
    });
  }

  function toggleRemovalCheckbox(teacherId: string, assignmentId: string) {
    setSelectedForRemoval((prev) => {
      const current = new Set(prev[teacherId] || []);
      if (current.has(assignmentId)) current.delete(assignmentId);
      else current.add(assignmentId);
      return { ...prev, [teacherId]: current };
    });
  }

  async function handleBulkRemove(teacherId: string) {
    const ids = Array.from(selectedForRemoval[teacherId] || []);
    if (ids.length === 0) return;
    if (!confirm(`Remove ${ids.length} assignment(s) from this teacher?`)) return;
    setRemoving(teacherId);
    await fetch(`/api/admin/teachers/${teacherId}/assignments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentIds: ids }),
    });
    setRemoving(null);
    setSelectedForRemoval((prev) => ({ ...prev, [teacherId]: new Set() }));
    load();
  }

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.user.name.toLowerCase().includes(q) ||
        t.user.email.toLowerCase().includes(q) ||
        t.assignments.some(
          (a) =>
            a.class.name.toLowerCase().includes(q) ||
            a.subject.name.toLowerCase().includes(q)
        )
    );
  }, [teachers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageTeachers = filteredTeachers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-3xl">
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
        <>
          <div className="relative max-w-xs mb-4">
            <Search className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, class, subject…"
              className="w-full pl-9 pr-3 py-2 border border-taupe/50 rounded-lg bg-white/60 text-sm focus:border-choc outline-none"
            />
          </div>

          {filteredTeachers.length === 0 ? (
            <p className="text-vandyke text-sm">No teachers match "{search}".</p>
          ) : (
        <ul className="space-y-4">
          {pageTeachers.map((t) => (
            <li
              key={t.id}
              className="bg-white/40 border border-taupe/30 rounded-lg px-4 py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={t.user.name} size={36} />
                  <div>
                    <p className="text-bistre font-medium">{t.user.name}</p>
                    <p className="text-vandyke text-sm">{t.user.email}</p>
                  </div>
                </div>
              </div>

              {t.assignments.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {t.assignments.map((a) => {
                      const checked = selectedForRemoval[t.id]?.has(a.id) || false;
                      return (
                        <label
                          key={a.id}
                          className={`text-xs rounded-full px-3 py-1 flex items-center gap-2 cursor-pointer transition-colors ${
                            checked
                              ? "bg-status-fail/15 text-status-fail"
                              : "bg-taupe/20 text-vandyke"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRemovalCheckbox(t.id, a.id)}
                            className="w-3 h-3"
                          />
                          {a.class.name} · {a.subject.name}
                        </label>
                      );
                    })}
                  </div>
                  {(selectedForRemoval[t.id]?.size || 0) > 0 && (
                    <button
                      onClick={() => handleBulkRemove(t.id)}
                      disabled={removing === t.id}
                      className="text-xs text-status-fail hover:underline disabled:opacity-50"
                    >
                      {removing === t.id
                        ? "Removing…"
                        : `Remove ${selectedForRemoval[t.id]?.size} selected`}
                    </button>
                  )}
                </div>
              )}

              <div className="border-t border-taupe/20 pt-3">
                <select
                  value={assignForm[t.id]?.classId || ""}
                  onChange={(e) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      [t.id]: {
                        classId: e.target.value,
                        subjectIds: prev[t.id]?.subjectIds || new Set(),
                      },
                    }))
                  }
                  className="border border-taupe/50 rounded-lg px-2 py-1.5 bg-white/60 text-sm mb-2 w-full sm:w-auto"
                >
                  <option value="">Select a class to assign subjects for…</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {assignForm[t.id]?.classId && (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-vandyke">
                        Tick every subject this teacher should be able to
                        enter results for in this class:
                      </p>
                      <button
                        onClick={() => toggleSelectAllSubjects(t.id)}
                        className="text-xs text-vandyke hover:text-bistre underline whitespace-nowrap ml-2"
                      >
                        {subjects.every((s) => assignForm[t.id]?.subjectIds.has(s.id))
                          ? "Clear all"
                          : "Select all"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3 max-h-40 overflow-y-auto bg-white/40 border border-taupe/30 rounded-lg p-2">
                      {subjects.map((s) => (
                        <label
                          key={s.id}
                          className="flex items-center gap-1.5 text-sm text-vandyke cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={assignForm[t.id]?.subjectIds.has(s.id) || false}
                            onChange={() => toggleSubjectCheckbox(t.id, s.id)}
                          />
                          {s.name}
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAssign(t.id)}
                      disabled={
                        assigning === t.id || (assignForm[t.id]?.subjectIds.size || 0) === 0
                      }
                      className="text-sm bg-vandyke hover:bg-bistre disabled:opacity-50 text-antique rounded-lg px-4 py-1.5 transition-colors"
                    >
                      {assigning === t.id
                        ? "Assigning…"
                        : `Assign ${assignForm[t.id]?.subjectIds.size || 0} subject(s)`}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
          )}
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
