"use client";

import { useEffect, useState } from "react";

type Term = { id: string; name: string; academicYear: string };
type SchoolAccount = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  notes: string | null;
};
type PaymentRow = {
  id: string;
  amountClaimed: number;
  receiptFileName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  submittedAt: string;
};

const MAX_RECEIPT_BYTES = 2.2 * 1024 * 1024; // ~2.2MB raw file

function naira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

export default function StudentFeesPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState("");

  const [accounts, setAccounts] = useState<SchoolAccount[]>([]);
  const [feeAmount, setFeeAmount] = useState<number | null>(null);
  const [approvedTotal, setApprovedTotal] = useState(0);
  const [balance, setBalance] = useState<number | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  const [loadingTerms, setLoadingTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    async function loadTerms() {
      setLoadingTerms(true);
      const res = await fetch("/api/student/terms");
      const data = await res.json();
      const termList: Term[] = data.terms || [];
      setTerms(termList);
      if (termList.length > 0) setSelectedTermId(termList[0].id);
      setLoadingTerms(false);
    }
    loadTerms();
  }, []);

  async function loadFees() {
    if (!selectedTermId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/fees?termId=${selectedTermId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't load fee details.");
        return;
      }
      setAccounts(data.accounts || []);
      setFeeAmount(data.feeAmount);
      setApprovedTotal(data.approvedTotal || 0);
      setBalance(data.balance);
      setPayments(data.payments || []);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTermId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFileError(null);
    if (f && f.size > MAX_RECEIPT_BYTES) {
      setFileError("That file is too large. Please upload an image under ~2MB.");
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!file) {
      setFileError("Attach a receipt image before submitting.");
      return;
    }
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setMessage({ type: "error", text: "Enter how much you paid." });
      return;
    }

    setSubmitting(true);
    try {
      const receiptDataUrl = await fileToDataUrl(file);
      const res = await fetch("/api/student/fee-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termId: selectedTermId,
          amountClaimed: amountNum,
          receiptDataUrl,
          receiptFileName: file.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Couldn't submit your payment." });
        return;
      }
      setMessage({ type: "success", text: "Payment submitted — the school office will review your receipt." });
      setAmount("");
      setFile(null);
      setShowForm(false);
      loadFees();
    } catch {
      setMessage({ type: "error", text: "Couldn't reach the server. Check your connection." });
    } finally {
      setSubmitting(false);
    }
  }

  const statusStyles: Record<PaymentRow["status"], string> = {
    PENDING: "bg-status-warn/10 text-status-warn",
    APPROVED: "bg-status-pass/10 text-status-pass",
    REJECTED: "bg-status-fail/10 text-status-fail",
  };

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-2xl">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">School Fees</h1>
      <p className="text-vandyke mb-6">
        Transfer to the account below, then submit your receipt so the
        school office can confirm your payment.
      </p>

      {loadingTerms ? (
        <p className="text-vandyke">Loading…</p>
      ) : terms.length === 0 ? (
        <p className="text-vandyke">No terms have been set up yet.</p>
      ) : (
        <select
          value={selectedTermId}
          onChange={(e) => setSelectedTermId(e.target.value)}
          className="border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 mb-6 max-w-xs"
        >
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.academicYear}
            </option>
          ))}
        </select>
      )}

      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : selectedTermId ? (
        <>
          {/* Bank details */}
          <div className="mb-6">
            <h2 className="font-display text-lg text-bistre font-semibold mb-2">
              Payment Account{accounts.length > 1 ? "s" : ""}
            </h2>
            {accounts.length === 0 ? (
              <p className="text-vandyke text-sm">
                The school hasn't published account details yet — contact the
                office directly.
              </p>
            ) : (
              <div className="space-y-3">
                {accounts.map((a) => (
                  <div key={a.id} className="bg-white/40 border border-taupe/30 rounded-lg px-4 py-3">
                    <p className="text-bistre font-medium">{a.bankName}</p>
                    <p className="text-vandyke text-sm font-mono">{a.accountNumber}</p>
                    <p className="text-vandyke text-sm">{a.accountName}</p>
                    {a.notes && <p className="text-vandyke text-xs mt-1">{a.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Balance summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/40 border border-taupe/30 rounded-lg p-4">
              <p className="text-xs text-vandyke uppercase tracking-wide mb-1">Fee</p>
              <p className="font-display text-lg text-bistre font-semibold">
                {feeAmount !== null ? naira(feeAmount) : "—"}
              </p>
            </div>
            <div className="bg-white/40 border border-taupe/30 rounded-lg p-4">
              <p className="text-xs text-vandyke uppercase tracking-wide mb-1">Paid</p>
              <p className="font-display text-lg text-status-pass font-semibold">
                {naira(approvedTotal)}
              </p>
            </div>
            <div className="bg-white/40 border border-taupe/30 rounded-lg p-4">
              <p className="text-xs text-vandyke uppercase tracking-wide mb-1">Balance</p>
              <p className="font-display text-lg text-bistre font-semibold">
                {balance !== null ? naira(balance) : "—"}
              </p>
            </div>
          </div>

          {message && (
            <p
              className={`text-sm mb-4 px-3 py-2 rounded-lg border ${
                message.type === "success"
                  ? "text-status-pass bg-status-pass/10 border-status-pass/30"
                  : "text-status-fail bg-status-fail/10 border-status-fail/30"
              }`}
            >
              {message.text}
            </p>
          )}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2.5 text-sm transition-colors mb-8"
            >
              I've paid — upload receipt
            </button>
          ) : (
            <form
              onSubmit={handleSubmitPayment}
              className="bg-white/40 border border-taupe/30 rounded-lg p-4 mb-8 space-y-3"
            >
              <p className="text-sm text-vandyke">
                You can submit the full amount or just a portion — every
                approved payment reduces your balance above.
              </p>
              <label className="block text-sm text-vandyke">
                Amount paid (₦)
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
                  required
                />
              </label>
              <label className="block text-sm text-vandyke">
                Receipt (image, under 2MB)
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="mt-1 w-full text-sm"
                  required
                />
              </label>
              {fileError && <p className="text-status-fail text-sm">{fileError}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-choc hover:bg-choc-dark disabled:opacity-60 text-antique font-medium rounded-lg px-5 py-2 text-sm transition-colors"
                >
                  {submitting ? "Submitting…" : "Submit for review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-sm text-vandyke hover:text-bistre"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Payment history */}
          <div>
            <h2 className="font-display text-lg text-bistre font-semibold mb-2">
              Your submissions
            </h2>
            {payments.length === 0 ? (
              <p className="text-vandyke text-sm">No payments submitted yet this term.</p>
            ) : (
              <ul className="space-y-2">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="bg-white/40 border border-taupe/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div>
                      <p className="text-bistre font-medium">{naira(p.amountClaimed)}</p>
                      <p className="text-vandyke text-xs">
                        {p.receiptFileName} · {new Date(p.submittedAt).toLocaleDateString()}
                      </p>
                      {p.status === "REJECTED" && p.adminNote && (
                        <p className="text-status-fail text-xs mt-1">Note: {p.adminNote}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusStyles[p.status]}`}
                    >
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
