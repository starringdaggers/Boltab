"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/shared/Avatar";

export default function ProfilePictureRequestForm({ displayName }: { displayName: string }) {
  const [currentPictureUrl, setCurrentPictureUrl] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<{ id: string; submittedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/student/profile-picture");
    const data = await res.json();
    setCurrentPictureUrl(data.currentPictureUrl);
    setPendingRequest(data.pendingRequest);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);

    if (file.size > 2_000_000) {
      setMessage({ type: "error", text: "That image is too large — please use one under 2MB." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setSubmitting(true);
      const res = await fetch("/api/student/profile-picture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: reader.result }),
      });
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        return;
      }
      setMessage({
        type: "success",
        text: "Submitted — your new picture will show once an admin approves it.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      load();
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-white/40 border border-taupe/30 rounded-card p-5 sm:p-6 mb-6">
      <h2 className="font-display text-lg text-bistre font-semibold mb-1">
        Profile Picture
      </h2>
      <p className="text-vandyke text-sm mb-4">
        Changes need admin approval before they show up everywhere.
      </p>

      {loading ? (
        <p className="text-vandyke text-sm">Loading…</p>
      ) : (
        <div className="flex items-center gap-4">
          <Avatar name={displayName} size={64} imageUrl={currentPictureUrl} />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelected}
              disabled={submitting}
              className="text-sm"
            />
            {pendingRequest && (
              <p className="text-status-warn text-xs mt-1.5">
                A picture change is pending admin approval (submitted{" "}
                {new Date(pendingRequest.submittedAt).toLocaleDateString()}).
                Uploading again will replace that pending request.
              </p>
            )}
          </div>
        </div>
      )}

      {message && (
        <p
          className={`text-sm mt-3 px-3 py-2 rounded-lg border inline-block ${
            message.type === "success"
              ? "text-status-pass bg-status-pass/10 border-status-pass/30"
              : "text-status-fail bg-status-fail/10 border-status-fail/30"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
