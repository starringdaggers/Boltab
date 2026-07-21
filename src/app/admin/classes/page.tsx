"use client";

import { useEffect, useState } from "react";

type ClassRow = { id: string; name: string; _count: { students: number } };

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/classes");
    const data = await res.json();
    setClasses(data.classes || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setNewName("");
    load();
  }

  async function handleRename(id: string) {
    const res = await fetch(`/api/admin/classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue }),
    });
    if (res.ok) {
      setEditingId(null);
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this class? This can't be undone.")) return;
    const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    load();
  }

  return (
    <div className="p-10 max-w-2xl">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Classes
      </h1>
      <p className="text-vandyke mb-8">
        e.g. JSS1, JSS2, SS1 Science. Students and teacher assignments are
        organized by class.
      </p>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New class name"
          className="flex-1 border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 focus:border-choc outline-none"
        />
        <button
          type="submit"
          className="bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2 transition-colors"
        >
          Add class
        </button>
      </form>
      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="text-vandyke">No classes yet — add your first one above.</p>
      ) : (
        <ul className="space-y-2">
          {classes.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between bg-white/40 border border-taupe/30 rounded-lg px-4 py-3"
            >
              {editingId === c.id ? (
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename(c.id)}
                  autoFocus
                  className="border border-taupe/50 rounded px-2 py-1 bg-white outline-none"
                />
              ) : (
                <span className="text-bistre font-medium">{c.name}</span>
              )}
              <div className="flex items-center gap-4">
                <span className="text-xs text-vandyke">
                  {c._count.students} student{c._count.students !== 1 && "s"}
                </span>
                {editingId === c.id ? (
                  <button
                    onClick={() => handleRename(c.id)}
                    className="text-sm text-status-pass"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditValue(c.name);
                    }}
                    className="text-sm text-vandyke hover:text-bistre"
                  >
                    Rename
                  </button>
                )}
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-sm text-status-fail"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
