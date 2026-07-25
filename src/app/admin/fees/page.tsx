"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Option = { id: string; name: string };
type Term = { id: string; name: string; academicYear: string };
type SchoolAccount = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  notes: string | null;
};
type ClassFeeRow = {
  id: string;
  amount: number;
  class: { id: string; name: string };
  term: { id: string; name: string; academicYear: string };
};

function naira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export default function AdminFeesPage() {
  const [accounts, setAccounts] = useState<SchoolAccount[]>([]);
  const [classFees, setClassFees] = useState<ClassFeeRow[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [accountForm, setAccountForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    notes: "",
  });
  const [savingAccount, setSavingAccount] = useState(false);

  const [feeForm, setFeeForm] = useState({ classId: "", termId: "", amount: "" });
  const [savingFee, setSavingFee] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [feeMessage, setFeeMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [accountsRes, classFeesRes, classesRes, termsRes, pendingRes] = await Promise.all([
        fetch("/api/admin/school-accounts"),
        fetch("/api/admin/class-fees"),
        fetch("/api/admin/classes"),
        fetch("/api/admin/terms"),
        fetch("/api/admin/fee-payments?status=PENDING"),
      ]);
      setAccounts((await accountsRes.json()).accounts || []);
      setClassFees((await classFeesRes.json()).classFees || []);
      setClasses((await classesRes.json()).classes || []);
      setTerms((await termsRes.json()).terms || []);
      const pendingData = await pendingRes.json();
      setPendingCount((pendingData.payments || []).length);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    setSavingAccount(true);
    const res = await fetch("/api/admin/school-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountForm),
    });
    const data = await res.json();
    setSavingAccount(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setAccountForm({ bankName: "", accountName: "", accountNumber: "", notes: "" });
    load();
  }

  async function handleDeleteAccount(id: string) {
    if (!confirm("Remove this bank account from the students' view?")) return;
    await fetch(`/api/admin/school-accounts/${id}`, { method: "DELETE" });
    load();
  }

  async function handleSetFee(e: React.FormEvent) {
    e.preventDefault();
    if (!feeForm.classId || !feeForm.termId || !feeForm.amount) return;
    setSavingFee(true);
    setFeeMessage(null);
    const wasEditing = !!editingFeeId;
    const res = await fetch("/api/admin/class-fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId: feeForm.classId,
        termId: feeForm.termId,
        amount: Number(feeForm.amount),
      }),
    });
    const data = await res.json();
    setSavingFee(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setFeeForm({ classId: "", termId: "", amount: "" });
    setEditingFeeId(null);
    setFeeMessage(wasEditing ? "Fee updated." : "Fee set.");
    load();
  }

  function startEditFee(cf: ClassFeeRow) {
    setFeeMessage(null);
    setEditingFeeId(cf.id);
    setFeeForm({
      classId: cf.class.id,
      termId: cf.term.id,
      amount: String(cf.amount),
    });
    document.getElementById("class-fee-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function cancelEditFee() {
    setEditingFeeId(null);
    setFeeForm({ classId: "", termId: "", amount: "" });
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-1">
        <h1 className="font-display text-3xl text-bistre font-semibold">School Fees</h1>
        <Link
          href="/admin/fees/payments"
          className="bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
        >
          Review payments{pendingCount ? ` (${pendingCount} pending)` : ""}
        </Link>
      </div>
      <p className="text-vandyke mb-8">
        Publish bank details for students, set the fee amount per class per
        term, then review submitted receipts.
      </p>

      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : (
        <>
          {/* Bank accounts */}
          <section className="mb-10">
            <h2 className="font-display text-lg text-bistre font-semibold mb-3">
              Payment Accounts
            </h2>
            {accounts.length > 0 && (
              <ul className="space-y-2 mb-4">
                {accounts.map((a) => (
                  <li
                    key={a.id}
                    className="bg-white/40 border border-taupe/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-bistre font-medium">
                        {a.bankName} — {a.accountNumber}
                      </p>
                      <p className="text-vandyke text-sm">{a.accountName}</p>
                      {a.notes && <p className="text-vandyke text-xs mt-0.5">{a.notes}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteAccount(a.id)}
                      className="text-sm text-status-fail whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form
              onSubmit={handleAddAccount}
              className="bg-white/40 border border-taupe/30 rounded-lg p-4 grid sm:grid-cols-2 gap-3"
            >
              <input
                value={accountForm.bankName}
                onChange={(e) => setAccountForm((p) => ({ ...p, bankName: e.target.value }))}
                placeholder="Bank name"
                required
                className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
              />
              <input
                value={accountForm.accountNumber}
                onChange={(e) => setAccountForm((p) => ({ ...p, accountNumber: e.target.value }))}
                placeholder="Account number"
                required
                className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
              />
              <input
                value={accountForm.accountName}
                onChange={(e) => setAccountForm((p) => ({ ...p, accountName: e.target.value }))}
                placeholder="Account name"
                required
                className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm sm:col-span-2"
              />
              <input
                value={accountForm.notes}
                onChange={(e) => setAccountForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Notes (optional) — e.g. use admission no. as reference"
                className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm sm:col-span-2"
              />
              <button
                type="submit"
                disabled={savingAccount}
                className="bg-vandyke hover:bg-bistre disabled:opacity-50 text-antique rounded-lg px-4 py-2 text-sm transition-colors sm:col-span-2 sm:w-fit"
              >
                {savingAccount ? "Adding…" : "Add account"}
              </button>
            </form>
          </section>

          {/* Class fees */}
          <section>
            <h2 className="font-display text-lg text-bistre font-semibold mb-3">
              Fee Amount per Class
            </h2>
            {classFees.length > 0 && (
              <ul className="space-y-1.5 mb-4">
                {classFees.map((cf) => (
                  <li
                    key={cf.id}
                    className="flex items-center justify-between text-sm bg-white/40 border border-taupe/30 rounded-lg px-4 py-2.5"
                  >
                    <span className="text-bistre">
                      {cf.class.name} · {cf.term.name} — {cf.term.academicYear}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-vandyke font-medium">{naira(cf.amount)}</span>
                      <button
                        onClick={() => startEditFee(cf)}
                        className="text-xs text-vandyke hover:text-bistre underline"
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {feeMessage && (
              <p className="text-sm text-status-pass bg-status-pass/10 border border-status-pass/30 rounded-lg px-3 py-2 mb-3 inline-block">
                {feeMessage}
              </p>
            )}
            <form
              id="class-fee-form"
              onSubmit={handleSetFee}
              className="bg-white/40 border border-taupe/30 rounded-lg p-4 flex flex-wrap gap-3 items-end"
            >
              {editingFeeId && (
                <p className="text-xs text-vandyke w-full">
                  Editing an existing fee — saving will overwrite the amount above.
                </p>
              )}
              <select
                value={feeForm.classId}
                onChange={(e) => setFeeForm((p) => ({ ...p, classId: e.target.value }))}
                required
                className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
              >
                <option value="">Class…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={feeForm.termId}
                onChange={(e) => setFeeForm((p) => ({ ...p, termId: e.target.value }))}
                required
                className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
              >
                <option value="">Term…</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.academicYear}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                step="0.01"
                value={feeForm.amount}
                onChange={(e) => setFeeForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="Amount (₦)"
                required
                className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm w-36"
              />
              <button
                type="submit"
                disabled={savingFee}
                className="bg-vandyke hover:bg-bistre disabled:opacity-50 text-antique rounded-lg px-4 py-2 text-sm transition-colors"
              >
                {savingFee ? "Saving…" : editingFeeId ? "Update fee" : "Set fee"}
              </button>
              {editingFeeId && (
                <button
                  type="button"
                  onClick={cancelEditFee}
                  className="text-sm text-vandyke hover:text-bistre"
                >
                  Cancel
                </button>
              )}
            </form>
          </section>
        </>
      )}
    </div>
  );
}
