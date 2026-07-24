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
    <main className="min-h-screen w-full flex items-center justify-center bg-antique-dim p-4 sm:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Left panel — brand + signature illustration (hidden on mobile) */}
        <div className="hidden md:flex relative flex-col justify-between bg-ocean-sunset overflow-hidden px-10 py-12">
          {/* Faint ledger lines — echoes a marked report sheet */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent, transparent 47px, #F4F2ED 48px)",
            }}
          />

          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.2em] text-taupe uppercase mb-1">
              Boltab
            </p>
            <p className="font-display text-lg text-antique font-semibold">
              Brilliant Schools
            </p>
          </div>

          <div className="relative z-10">
            <h1 className="font-display text-3xl lg:text-4xl text-antique font-semibold mb-3 leading-tight">
              Every grade,
              <br />
              on record.
            </h1>
            <p className="text-taupe max-w-xs">
              Students track their progress. Teachers post results in
              minutes. One record, always up to date.
            </p>
          </div>

          <div className="relative z-10 flex justify-center">
            {/* Seal badge — signature element */}
            <svg viewBox="0 0 160 160" className="w-28 h-28" aria-hidden="true">
              <circle
                cx="80"
                cy="80"
                r="76"
                fill="none"
                stroke="#F4F2ED"
                strokeWidth="2"
                strokeDasharray="4 6"
              />
              <circle cx="80" cy="80" r="60" fill="#F4F2ED" opacity="0.08" />
              <text
                x="80"
                y="72"
                textAnchor="middle"
                fill="#F4F2ED"
                fontFamily="var(--font-fraunces)"
                fontSize="34"
                fontWeight="600"
              >
                A+
              </text>
              <text
                x="80"
                y="98"
                textAnchor="middle"
                fill="#7C97A0"
                fontFamily="var(--font-plexmono)"
                fontSize="9"
                letterSpacing="2"
              >
                RESULTS PORTAL
              </text>
            </svg>
          </div>
        </div>

        {/* Right panel — the form, on a clean light background */}
        <div className="flex items-center justify-center bg-antique px-6 py-14 sm:px-12">
          <div className="w-full max-w-sm">
            <p className="md:hidden font-mono text-xs tracking-[0.2em] text-vandyke uppercase mb-3">
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
                  className="w-full bg-transparent border-b border-taupe/60 text-bistre placeholder:text-vandyke/40 py-2 focus:border-choc transition-colors outline-none"
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
                    className="w-full bg-transparent border-b border-taupe/60 text-bistre py-2 pr-10 focus:border-choc transition-colors outline-none"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-vandyke/70 hover:text-bistre transition-colors p-1"
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
                  className="text-sm text-vandyke hover:text-bistre transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-choc hover:bg-choc-dark disabled:opacity-60 disabled:cursor-not-allowed text-antique font-semibold rounded-full py-3.5 transition-colors"
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
