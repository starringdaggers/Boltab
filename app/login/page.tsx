"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setLoading(false);
        return;
      }

      router.push(data.redirectPath);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white p-4 sm:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-[2rem] overflow-hidden shadow-2xl border border-antique-dim">
        {/* Left panel — solid brand color, simple illustration, no marketing copy */}
        <div className="hidden md:flex relative flex-col justify-between bg-choc px-10 py-12">
          <p className="font-mono text-xs tracking-[0.2em] text-white uppercase">
            Boltab Brilliant Schools
          </p>

          <div className="flex justify-center">
            <svg viewBox="0 0 300 220" className="w-full max-w-[240px]" aria-hidden="true">
              {/* floating lightbulb accent */}
              <g opacity="0.85">
                <circle cx="248" cy="30" r="12" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M248 42v8M242 54h12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M243 26a6 6 0 0 1 10 0" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
              </g>

              {/* small potted plant */}
              <g>
                <path d="M18 176h20l-3 26H21l-3-26Z" fill="#E4E3FF" />
                <path d="M28 176c0-14-16-18-16-30 10 0 16 12 16 22 0-16 14-22 22-18-2 14-14 20-22 26Z" fill="#A8A6E8" />
              </g>

              {/* desk */}
              <rect x="60" y="150" width="190" height="10" rx="3" fill="#5958D5" />
              <rect x="70" y="160" width="8" height="40" fill="#5958D5" />
              <rect x="222" y="160" width="8" height="40" fill="#5958D5" />

              {/* stacked books on the desk */}
              <g>
                <rect x="196" y="128" width="46" height="11" rx="2" fill="#454390" transform="rotate(-3 196 128)" />
                <rect x="198" y="116" width="42" height="11" rx="2" fill="#FFFFFF" opacity="0.9" transform="rotate(2 198 116)" />
                <rect x="200" y="104" width="38" height="11" rx="2" fill="#A8A6E8" transform="rotate(-2 200 104)" />
              </g>

              {/* student, seated behind the desk */}
              <g>
                <rect x="128" y="132" width="34" height="12" rx="6" fill="#2F2E71" />
                <path d="M104 150c0-30 20-46 46-46s46 16 46 46" fill="#454390" />
                <rect x="118" y="136" width="36" height="12" rx="6" fill="#2F2E71" />
                <circle cx="150" cy="86" r="22" fill="#FFFFFF" />
                <path d="M129 82a21 21 0 0 1 42 0c-6-4-12-6-21-6s-15 2-21 6Z" fill="#2F2E71" />
                <rect x="150" y="128" width="30" height="5" rx="2.5" fill="#FFFFFF" transform="rotate(-18 150 128)" />
              </g>

              {/* open book in front of the student */}
              <path d="M112 150c10-6 22-6 32 0v14c-10-6-22-6-32 0Z" fill="#FFFFFF" />
              <path d="M176 150c-10-6-22-6-32 0v14c10-6 22-6 32 0Z" fill="#FFFFFF" opacity="0.85" />
              <path d="M144 150v14" stroke="#A8A6E8" strokeWidth="1.5" />
            </svg>
          </div>

          <div />
        </div>

        {/* Right panel — the form, clean and light */}
        <div className="flex items-center justify-center bg-white px-6 py-14 sm:px-12">
          <div className="w-full max-w-sm">
            <p className="md:hidden font-mono text-xs tracking-[0.2em] text-taupe uppercase mb-3">
              Boltab Brilliant Schools
            </p>
            <h2 className="font-display text-3xl text-bistre font-semibold mb-2">
              Welcome back
            </h2>
            <p className="text-vandyke mb-10">
              Sign in to view or manage results.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-vandyke mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-taupe/50 rounded-lg bg-white text-bistre placeholder:text-taupe/60 px-3.5 py-2.5 focus:border-choc outline-none transition-colors"
                  placeholder="you@boltabschools.edu"
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-vandyke mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-taupe/50 rounded-lg bg-white text-bistre px-3.5 py-2.5 pr-10 focus:border-choc outline-none transition-colors"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-taupe hover:text-bistre transition-colors p-2.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 3l18 18" strokeLinecap="round" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" />
                        <path d="M9.4 5.3A10.4 10.4 0 0 1 12 5c5 0 9 4 10 7-.4 1.1-1.1 2.3-2.1 3.4M6.6 6.6C4.6 8 3.3 9.9 2 12c1 3 5 7 10 7 1.2 0 2.4-.2 3.4-.6" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-sm text-status-fail bg-status-fail/10 border border-status-fail/30 rounded-lg px-3 py-2"
                >
                  {error}
                </p>
              )}

              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-sm text-choc hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-choc hover:bg-choc-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-full py-3.5 transition-colors"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-sm text-vandyke mt-8 text-center">
              Trouble accessing your account? Contact the school office.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
