"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TimetableBuilder({
  timetableId,
  initialTitle,
  initialColumns,
  initialRows,
}: {
  timetableId?: string;
  initialTitle?: string;
  initialColumns?: string[];
  initialRows?: string[][];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle || "");
  const [columns, setColumns] = useState<string[]>(
    initialColumns && initialColumns.length > 0 ? initialColumns : ["Monday", "Tuesday"]
  );
  const [rows, setRows] = useState<string[][]>(
    initialRows && initialRows.length > 0
      ? initialRows
      : [Array(columns.length).fill("")]
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addColumn() {
    setColumns((prev) => [...prev, `Column ${prev.length + 1}`]);
    setRows((prev) => prev.map((r) => [...r, ""]));
  }

  function removeColumn(index: number) {
    if (columns.length <= 1) return;
    setColumns((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) => prev.map((r) => r.filter((_, i) => i !== index)));
  }

  function renameColumn(index: number, value: string) {
    setColumns((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  function addRow() {
    setRows((prev) => [...prev, Array(columns.length).fill("")]);
  }

  function removeRow(index: number) {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    setRows((prev) =>
      prev.map((r, ri) => (ri === rowIndex ? r.map((c, ci) => (ci === colIndex ? value : c)) : r))
    );
  }

  async function handleSave() {
    setError(null);
    if (!title.trim()) {
      setError("Give this timetable a title.");
      return;
    }
    setSaving(true);
    const url = timetableId ? `/api/admin/timetables/${timetableId}` : "/api/admin/timetables";
    const method = timetableId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, columns, rows }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Couldn't save this timetable.");
      return;
    }
    router.push("/admin/timetables");
  }

  async function handleDelete() {
    if (!timetableId) return;
    if (!confirm("Delete this timetable? This can't be undone.")) return;
    setDeleting(true);
    await fetch(`/api/admin/timetables/${timetableId}`, { method: "DELETE" });
    setDeleting(false);
    router.push("/admin/timetables");
  }

  return (
    <div className="max-w-4xl">
      <label className="block text-sm text-vandyke mb-1.5 max-w-md">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Boltab-Basic 6 — Weekly Timetable"
          className="mt-1 w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 focus:border-choc outline-none"
        />
      </label>

      {error && <p className="text-status-fail text-sm mt-4">{error}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="border-collapse min-w-[560px]">
          <thead>
            <tr>
              <th className="w-8" />
              {columns.map((col, ci) => (
                <th key={ci} className="p-1">
                  <div className="flex items-center gap-1">
                    <input
                      value={col}
                      onChange={(e) => renameColumn(ci, e.target.value)}
                      className="w-32 border border-taupe/50 rounded px-2 py-1 bg-white/60 text-sm font-medium text-bistre"
                    />
                    <button
                      onClick={() => removeColumn(ci)}
                      disabled={columns.length <= 1}
                      aria-label={`Remove column ${col}`}
                      className="text-status-fail disabled:opacity-30 text-lg leading-none px-1"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
              <th className="p-1">
                <button
                  onClick={addColumn}
                  className="text-sm text-vandyke hover:text-bistre border border-dashed border-taupe/50 rounded px-3 py-1.5 whitespace-nowrap"
                >
                  + Column
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td className="p-1 align-top pt-2">
                  <button
                    onClick={() => removeRow(ri)}
                    disabled={rows.length <= 1}
                    aria-label={`Remove row ${ri + 1}`}
                    className="text-status-fail disabled:opacity-30 text-lg leading-none px-1"
                  >
                    ×
                  </button>
                </td>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1">
                    <input
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      className="w-32 border border-taupe/50 rounded px-2 py-1.5 bg-white/60 text-sm"
                    />
                  </td>
                ))}
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="mt-2 text-sm text-vandyke hover:text-bistre border border-dashed border-taupe/50 rounded px-3 py-1.5"
      >
        + Row
      </button>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-choc hover:bg-choc-dark disabled:opacity-60 text-antique font-medium rounded-lg px-6 py-2.5 transition-colors"
        >
          {saving ? "Saving…" : "Save timetable"}
        </button>
        {timetableId && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-status-fail hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete this timetable"}
          </button>
        )}
      </div>
    </div>
  );
}
