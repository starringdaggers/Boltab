"use client";

import { useEffect, useState } from "react";

type PaymentRow = {
  id: string;
  amountClaimed: number;
  receiptFileName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  submittedAt: string;
  student: { user: { name: string }; class: { name: string }; admissionNo: string };
  term: { name: string; academicYear: string };
};

type PaymentDetail = PaymentRow & { receiptDataUrl: string };

function naira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export default function AdminFeePaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "">(
    "PENDING"
  );
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PaymentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [note, setNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/fee-payments${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't load payments.");
        return;
      }
      setPayments(data.payments || []);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function openReceipt(id: string) {
    setOpenId(id);
    setDetail(null);
    setNote("");
    setLoadingDetail(true);
    const res = await fetch(`/api/admin/fee-payments/${id}`);
    const data = await res.json();
    setLoadingDetail(false);
    if (res.ok) setDetail(data.payment);
  }

  async function review(status: "APPROVED" | "REJECTED") {
    if (!openId) return;
    setReviewing(true);
    await fetch(`/api/admin/fee-payments/${openId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: note || null }),
    });
    setReviewing(false);
    setOpenId(null);
    setDetail(null);
    load();
  }

  const statusStyles: Record<PaymentRow["status"], string> = {
    PENDING: "bg-status-warn/10 text-status-warn",
    APPROVED: "bg-status-pass/10 text-status-pass",
    REJECTED: "bg-status-fail/10 text-status-fail",
  };

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-3xl">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Fee Payment Review
      </h1>
      <p className="text-vandyke mb-6">
        Check each receipt against the account it was paid into, then
        approve or reject. Approved amounts count toward the student's
        balance immediately.
      </p>

      <div className="flex gap-2 mb-6">
        {(["PENDING", "APPROVED", "REJECTED", ""] as const).map((s) => (
          <button
            key={s || "ALL"}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              statusFilter === s
                ? "bg-vandyke text-antique"
                : "bg-taupe/20 text-vandyke hover:bg-taupe/30"
            }`}
          >
            {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <p className="text-status-fail text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : payments.length === 0 ? (
        <p className="text-vandyke">Nothing here.</p>
      ) : (
        <ul className="space-y-2">
          {payments.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => openReceipt(p.id)}
                className="w-full text-left bg-white/40 hover:bg-white/60 border border-taupe/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3 flex-wrap transition-colors"
              >
                <div>
                  <p className="text-bistre font-medium">
                    {p.student.user.name}{" "}
                    <span className="text-vandyke font-normal text-sm">
                      ({p.student.class.name})
                    </span>
                  </p>
                  <p className="text-vandyke text-xs">
                    {naira(p.amountClaimed)} · {p.term.name} {p.term.academicYear} ·{" "}
                    {new Date(p.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusStyles[p.status]}`}
                >
                  {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Receipt review modal */}
      {openId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bistre/60 p-4">
          <div className="bg-white rounded-card max-w-lg w-full max-h-[85vh] overflow-y-auto p-6">
            {loadingDetail || !detail ? (
              <p className="text-vandyke">Loading…</p>
            ) : (
              <>
                <p className="font-display text-lg text-bistre font-semibold mb-1">
                  {detail.student.user.name}
                </p>
                <p className="text-vandyke text-sm mb-4">
                  {detail.student.class.name} · {detail.student.admissionNo} ·{" "}
                  {detail.term.name} {detail.term.academicYear}
                </p>
                <p className="text-bistre font-semibold mb-3">{naira(detail.amountClaimed)}</p>

                {detail.receiptDataUrl.startsWith("data:image") ? (
                  <img
                    src={detail.receiptDataUrl}
                    alt="Payment receipt"
                    className="w-full rounded-lg border border-taupe/30 mb-4"
                  />
                ) : (
                  <a
                    href={detail.receiptDataUrl}
                    download={detail.receiptFileName}
                    className="block text-choc underline mb-4"
                  >
                    Download receipt ({detail.receiptFileName})
                  </a>
                )}

                {detail.status === "PENDING" ? (
                  <>
                    <label className="block text-sm text-vandyke mb-1.5">
                      Note (optional, e.g. reason for rejection)
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        className="mt-1 w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60 text-sm"
                      />
                    </label>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => review("APPROVED")}
                        disabled={reviewing}
                        className="bg-status-pass/90 hover:bg-status-pass disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => review("REJECTED")}
                        disabled={reviewing}
                        className="bg-status-fail/90 hover:bg-status-fail disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setOpenId(null)}
                        className="text-sm text-vandyke hover:text-bistre ml-auto"
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      className={`text-sm px-3 py-2 rounded-lg inline-block ${statusStyles[detail.status]}`}
                    >
                      Already {detail.status.toLowerCase()}
                      {detail.adminNote ? ` — ${detail.adminNote}` : ""}
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => setOpenId(null)}
                        className="text-sm text-vandyke hover:text-bistre"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
