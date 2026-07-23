"use client";

import { useEffect, useRef, useState } from "react";

type StudentRow = {
  id: string;
  admissionNo: string;
  user: { id: string; name: string; email: string };
  class: { id: string; name: string };
};
type Option = { id: string; name: string };

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    admissionNo: "",
    classId: "",
  });
  const [newCredentials, setNewCredentials] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);

  const [importResult, setImportResult] = useState<{
    created: { name: string; email: string; tempPassword: string }[];
    errors: { row: number; reason: string }[];
  } | null>(null);
  const [importing, setImporting] = useState(false);

  async function load() {
    setLoading(true);
    const [studentsRes, classesRes] = await Promise.all([
      fetch("/api/admin/students"),
      fetch("/api/admin/classes"),
    ]);
    const studentsData = await studentsRes.json();
    const classesData = await classesRes.json();
    setStudents(studentsData.students || []);
    setClasses(classesData.classes || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNewCredentials(null);
    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setNewCredentials({ email: data.user.email, tempPassword: data.tempPassword });
    setForm({ name: "", email: "", admissionNo: "", classId: "" });
    load();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const text = await file.text();
    const res = await fetch("/api/admin/students/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: text }),
    });
    const data = await res.json();
    setImportResult(data);
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    load();
  }

  function downloadCredentialsCsv() {
    if (!importResult?.created.length) return;
    const header = "name,email,tempPassword\n";
    const rows = importResult.created
      .map((c) => `${c.name},${c.email},${c.tempPassword}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-credentials.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-3xl">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Students
      </h1>
      <p className="text-vandyke mb-8">
        Add one student at a time, or bulk import a whole class via CSV.
      </p>

      {/* Single create */}
      <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 mb-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
          className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 focus:border-choc outline-none"
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          type="email"
          className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 focus:border-choc outline-none"
        />
        <input
          value={form.admissionNo}
          onChange={(e) => setForm({ ...form, admissionNo: e.target.value })}
          placeholder="Admission number"
          className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 focus:border-choc outline-none"
        />
        <select
          value={form.classId}
          onChange={(e) => setForm({ ...form, classId: e.target.value })}
          className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
        >
          <option value="">Select class…</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="col-span-2 bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg py-2 transition-colors"
        >
          Add student
        </button>
      </form>
      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}
      {newCredentials && (
        <div className="bg-status-pass/10 border border-status-pass/30 rounded-lg px-4 py-3 mb-8 text-sm">
          <p className="text-bistre font-medium mb-1">
            Account created — share these credentials with the student now.
          </p>
          <p className="font-mono text-vandyke">
            {newCredentials.email} / {newCredentials.tempPassword}
          </p>
        </div>
      )}

      {/* CSV bulk import */}
      <div className="bg-white/40 border border-taupe/30 rounded-card p-6 mb-8">
        <h2 className="font-display text-xl text-bistre font-semibold mb-2">
          Bulk import via CSV
        </h2>
        <p className="text-sm text-vandyke mb-4">
          File must have a header row exactly like this:{" "}
          <code className="font-mono bg-taupe/20 px-1.5 py-0.5 rounded">
            name,email,admissionNo,className
          </code>
          . <code className="font-mono">className</code> must match an
          existing class name.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelected}
          disabled={importing}
          className="text-sm"
        />
        {importing && <p className="text-vandyke text-sm mt-2">Importing…</p>}

        {importResult && (
          <div className="mt-4 space-y-3">
            {importResult.created.length > 0 && (
              <div className="bg-status-pass/10 border border-status-pass/30 rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-bistre font-medium">
                    {importResult.created.length} account(s) created.
                  </p>
                  <button
                    onClick={downloadCredentialsCsv}
                    className="text-status-pass underline text-xs"
                  >
                    Download credentials CSV
                  </button>
                </div>
                <p className="text-vandyke text-xs">
                  These temporary passwords are only shown once — download
                  and distribute them now.
                </p>
              </div>
            )}
            {importResult.errors.length > 0 && (
              <div className="bg-status-fail/10 border border-status-fail/30 rounded-lg px-4 py-3 text-sm">
                <p className="text-bistre font-medium mb-1">
                  {importResult.errors.length} row(s) skipped:
                </p>
                <ul className="text-vandyke text-xs space-y-0.5">
                  {importResult.errors.map((e, i) => (
                    <li key={i}>
                      Row {e.row}: {e.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Roster */}
      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : students.length === 0 ? (
        <p className="text-vandyke">No students yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-vandyke border-b border-taupe/30">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Admission No.</th>
                <th className="py-2 font-medium">Class</th>
                <th className="py-2 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-taupe/10">
                  <td className="py-2 text-bistre">{s.user.name}</td>
                  <td className="py-2 font-mono text-vandyke">{s.admissionNo}</td>
                  <td className="py-2 text-vandyke">{s.class.name}</td>
                  <td className="py-2 text-vandyke">{s.user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
