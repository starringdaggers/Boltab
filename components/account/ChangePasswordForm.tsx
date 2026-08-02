"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation don't match." });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    setSaving(true);
    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error });
      return;
    }
    setMessage({ type: "success", text: "Password changed successfully." });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="max-w-md">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">Change Password</h1>
      <p className="text-vandyke mb-6">Update the password you use to sign in.</p>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-vandyke">
          Current password
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
          />
        </label>
        <label className="block text-sm text-vandyke">
          New password
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
          />
        </label>
        <label className="block text-sm text-vandyke">
          Confirm new password
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full border border-taupe/50 rounded-lg px-3 py-2 bg-white/60"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="bg-choc hover:bg-choc-dark disabled:opacity-60 text-antique font-medium rounded-lg px-6 py-2.5 transition-colors"
        >
          {saving ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
