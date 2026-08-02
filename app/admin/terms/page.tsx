"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TermRow = {
  id: string;
  name: string;
  academicYear: string;
  isLocked: boolean;
  resultsReleased: boolean;
};

export default function TermsPage() {
  const [terms, setTerms] = useState<TermRow[]>([]);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/terms");
    const data = await res.json();
    setTerms(data.terms || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, academicYear: year }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setName("");
    setYear("");
    load();
  }

  async function toggleLock(term: TermRow) {
    await fetch(`/api/admin/terms/${term.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLocked: !term.isLocked }),
    });
    load();
  }

  async function toggleRelease(term: TermRow) {
    await fetch(`/api/admin/terms/${term.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultsReleased: !term.resultsReleased }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this term? This can't be undone.")) return;
    const res = await fetch(`/api/admin/terms/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    load();
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-2xl">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Terms
      </h1>
      <p className="text-vandyke mb-8">
        Lock a term once results are finalized — teachers can no longer edit
        results for a locked term. Release a term's results once you're ready
        for students to see them; you can also withhold individual students'
        report cards from the{" "}
        <Link href="/admin/report-cards" className="underline hover:text-bistre">
          Report Cards page
        </Link>
        .
      </p>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. First Term"
          className="flex-1 border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 focus:border-choc outline-none"
        />
        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g. 2026/2027"
          className="flex-1 border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 focus:border-choc outline-none"
        />
        <button
          type="submit"
          className="bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2 transition-colors whitespace-nowrap"
        >
          Add term
        </button>
      </form>
      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : terms.length === 0 ? (
        <p className="text-vandyke">No terms yet — add your first one above.</p>
      ) : (
        <ul className="space-y-2">
          {terms.map((t) => (
            <li
              key={t.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/40 border border-taupe/30 rounded-lg px-4 py-3"
            >
              <div>
                <span className="text-bistre font-medium">{t.name}</span>
                <span className="text-vandyke text-sm ml-2">
                  {t.academicYear}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    t.isLocked
                      ? "bg-status-fail/10 text-status-fail"
                      : "bg-status-pass/10 text-status-pass"
                  }`}
                >
                  {t.isLocked ? "Locked" : "Open"}
                </span>
                <button
                  onClick={() => toggleLock(t)}
                  className="text-sm text-vandyke hover:text-bistre whitespace-nowrap"
                >
                  {t.isLocked ? "Unlock" : "Lock"}
                </button>

                <span
                  className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    t.resultsReleased
                      ? "bg-status-pass/10 text-status-pass"
                      : "bg-taupe/20 text-vandyke"
                  }`}
                >
                  {t.resultsReleased ? "Released to students" : "Not released"}
                </span>
                <button
                  onClick={() => toggleRelease(t)}
                  className="text-sm text-vandyke hover:text-bistre whitespace-nowrap"
                >
                  {t.resultsReleased ? "Withhold" : "Release"}
                </button>

                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-sm text-status-fail whitespace-nowrap"
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
