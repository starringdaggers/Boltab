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
type LineItem = { label: string; amount: number };
type ClassFeeRow = {
  id: string;
  amount: number;
  lineItems: LineItem[] | null;
  isReleased: boolean;
  releasedAt: string | null;
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

  const [feeForm, setFeeForm] = useState<{ classId: string; termId: string; lineItems: LineItem[] }>({
    classId: "",
    termId: "",
    lineItems: [{ label: "School fees", amount: 0 }],
  });
  const [savingFee, setSavingFee] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [feeMessage, setFeeMessage] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
    const validItems = feeForm.lineItems.filter((li) => li.label.trim() !== "");
    if (!feeForm.classId || !feeForm.termId || validItems.length === 0) return;
    setSavingFee(true);
    setFeeMessage(null);
    const wasEditing = !!editingFeeId;
    const res = await fetch("/api/admin/class-fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId: feeForm.classId,
        termId: feeForm.termId,
        lineItems: validItems,
      }),
    });
    const data = await res.json();
    setSavingFee(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setFeeForm({ classId: "", termId: "", lineItems: [{ label: "School fees", amount: 0 }] });
    setEditingFeeId(null);
    setFeeMessage(wasEditing ? "Bill updated." : "Bill saved as draft — release it when ready.");
    load();
  }

  function startEditFee(cf: ClassFeeRow) {
    setFeeMessage(null);
    setEditingFeeId(cf.id);
    setFeeForm({
      classId: cf.class.id,
      termId: cf.term.id,
      lineItems: cf.lineItems && cf.lineItems.length > 0
        ? cf.lineItems
        : [{ label: "School fees", amount: cf.amount }],
    });
    document.getElementById("class-fee-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function cancelEditFee() {
    setEditingFeeId(null);
    setFeeForm({ classId: "", termId: "", lineItems: [{ label: "School fees", amount: 0 }] });
  }

  function addLineItem() {
    setFeeForm((p) => ({ ...p, lineItems: [...p.lineItems, { label: "", amount: 0 }] }));
  }

  function removeLineItem(index: number) {
    setFeeForm((p) => ({ ...p, lineItems: p.lineItems.filter((_, i) => i !== index) }));
  }

  function updateLineItem(index: number, field: "label" | "amount", value: string) {
    setFeeForm((p) => ({
      ...p,
      lineItems: p.lineItems.map((li, i) =>
        i === index ? { ...li, [field]: field === "amount" ? Number(value) || 0 : value } : li
      ),
    }));
  }

  async function handleToggleRelease(cf: ClassFeeRow) {
    setTogglingId(cf.id);
    const res = await fetch(`/api/admin/class-fees/${cf.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isReleased: !cf.isReleased }),
    });
    setTogglingId(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    load();
  }

  async function handleDeleteFee(id: string) {
    if (!confirm("Delete this bill entirely? Students will no longer see it.")) return;
    await fetch(`/api/admin/class-fees/${id}`, { method: "DELETE" });
    load();
  }

  const draftTotal = feeForm.lineItems.reduce((sum, li) => sum + (Number(li.amount) || 0), 0);

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
            <h2 className="font-display text-lg text-bistre font-semibold mb-1">
              Fee Bills per Class
            </h2>
            <p className="text-vandyke text-sm mb-3">
              Build the itemized bill for a class, then release it — students
              never see a bill until you release it, so you can draft and
              adjust freely first.
            </p>
            {classFees.length > 0 && (
              <ul className="space-y-2 mb-4">
                {classFees.map((cf) => {
                  const items = cf.lineItems && cf.lineItems.length > 0
                    ? cf.lineItems
                    : [{ label: "Total fee", amount: cf.amount }];
                  return (
                    <li
                      key={cf.id}
                      className="bg-white/40 border border-taupe/30 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                        <span className="text-bistre font-medium">
                          {cf.class.name} · {cf.term.name} — {cf.term.academicYear}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                            cf.isReleased
                              ? "bg-status-pass/10 text-status-pass"
                              : "bg-taupe/20 text-vandyke"
                          }`}
                        >
                          {cf.isReleased ? "Released to students" : "Draft — hidden from students"}
                        </span>
                      </div>
                      <div className="text-sm text-vandyke mb-2 space-y-0.5">
                        {items.map((li, i) => (
                          <div key={i} className="flex justify-between max-w-xs">
                            <span>{li.label}</span>
                            <span className="font-mono">{naira(li.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between max-w-xs font-semibold text-bistre pt-1 border-t border-taupe/20">
                          <span>Total</span>
                          <span className="font-mono">{naira(cf.amount)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <button
                          onClick={() => startEditFee(cf)}
                          className="text-vandyke hover:text-bistre underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleRelease(cf)}
                          disabled={togglingId === cf.id}
                          className="text-choc hover:underline disabled:opacity-50"
                        >
                          {togglingId === cf.id ? "Working…" : cf.isReleased ? "Unrelease" : "Release to students"}
                        </button>
                        <button
                          onClick={() => handleDeleteFee(cf.id)}
                          className="text-status-fail hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
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
              className="bg-white/40 border border-taupe/30 rounded-lg p-4"
            >
              {editingFeeId && (
                <p className="text-xs text-vandyke mb-3">
                  Editing an existing bill — saving will overwrite it below.
                </p>
              )}
              <div className="flex flex-wrap gap-3 mb-4">
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
              </div>

              <p className="text-xs text-vandyke uppercase tracking-wide font-mono mb-2">
                Bill line items
              </p>
              <div className="space-y-2 mb-3">
                {feeForm.lineItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={item.label}
                      onChange={(e) => updateLineItem(i, "label", e.target.value)}
                      placeholder="e.g. School fees, Examination, Development"
                      className="flex-1 border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.amount || ""}
                      onChange={(e) => updateLineItem(i, "amount", e.target.value)}
                      placeholder="₦"
                      className="w-32 border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
                    />
                    {feeForm.lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(i)}
                        className="text-status-fail text-sm px-1"
                        aria-label="Remove line item"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="text-xs text-choc hover:underline mb-4"
              >
                + Add another line item
              </button>

              <div className="flex items-center justify-between border-t border-taupe/20 pt-3">
                <p className="text-sm text-bistre font-semibold">
                  Total: <span className="font-mono">{naira(draftTotal)}</span>
                </p>
                <div className="flex items-center gap-3">
                  {editingFeeId && (
                    <button
                      type="button"
                      onClick={cancelEditFee}
                      className="text-sm text-vandyke hover:text-bistre"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingFee}
                    className="bg-vandyke hover:bg-bistre disabled:opacity-50 text-antique rounded-lg px-4 py-2 text-sm transition-colors"
                  >
                    {savingFee ? "Saving…" : editingFeeId ? "Update bill" : "Save as draft"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
