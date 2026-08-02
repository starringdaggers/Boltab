"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/shared/Avatar";

type Req = {
  id: string;
  imageDataUrl: string;
  submittedAt: string;
  user: { id: string; name: string; email: string; role: string; profilePictureUrl: string | null };
};

export default function AdminProfilePicturesPage() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/profile-pictures");
    const data = await res.json();
    setRequests(data.requests || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReview(id: string, decision: "APPROVE" | "REJECT") {
    setWorkingId(id);
    await fetch(`/api/admin/profile-pictures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setWorkingId(null);
    load();
  }

  return (
    <div className="p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Profile Picture Requests
      </h1>
      <p className="text-vandyke mb-8">
        Students' new profile pictures wait here until you approve them.
      </p>

      {loading ? (
        <p className="text-vandyke">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-vandyke">No pending requests.</p>
      ) : (
        <ul className="space-y-4 max-w-2xl">
          {requests.map((r) => (
            <li
              key={r.id}
              className="bg-white/40 border border-taupe/30 rounded-lg px-4 py-4 flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-[10px] text-vandyke uppercase mb-1">Current</p>
                  <Avatar name={r.user.name} size={48} imageUrl={r.user.profilePictureUrl} />
                </div>
                <span className="text-taupe text-xl">→</span>
                <div className="text-center">
                  <p className="text-[10px] text-vandyke uppercase mb-1">Requested</p>
                  <img
                    src={r.imageDataUrl}
                    alt="Requested"
                    className="w-12 h-12 rounded-full object-cover border-2 border-choc"
                  />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-bistre font-medium">{r.user.name}</p>
                <p className="text-vandyke text-sm">
                  {r.user.role.charAt(0) + r.user.role.slice(1).toLowerCase()} · {r.user.email}
                </p>
                <p className="text-vandyke text-xs mt-0.5">
                  Submitted {new Date(r.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleReview(r.id, "APPROVE")}
                  disabled={workingId === r.id}
                  className="text-xs bg-status-pass/10 hover:bg-status-pass/20 text-status-pass rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReview(r.id, "REJECT")}
                  disabled={workingId === r.id}
                  className="text-xs bg-status-fail/10 hover:bg-status-fail/20 text-status-fail rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
