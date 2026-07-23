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
    <main className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* Left panel — the form */}
      <div className="flex items-center justify-center bg-bistre px-8 py-16 md:px-16">
        <div className="w-full max-w-sm">
          <p className="font-mono text-xs tracking-[0.2em] text-taupe uppercase mb-3">
            Boltab Brilliant Schools
          </p>
          <h1 className="font-display text-4xl text-antique font-semibold mb-2">
            Welcome back
          </h1>
          <p className="text-taupe mb-10">
            Sign in to view or manage results.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-antique mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-taupe/60 text-antique placeholder:text-taupe/50 py-2 focus:border-choc transition-colors outline-none"
                placeholder="you@boltabschools.edu"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm text-antique mb-1.5"
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
                  className="w-full bg-transparent border-b border-taupe/60 text-antique py-2 pr-12 focus:border-choc transition-colors outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-taupe hover:text-antique transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
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
                className="text-sm text-taupe hover:text-antique transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-choc hover:bg-choc-dark disabled:opacity-60 disabled:cursor-not-allowed text-antique font-medium rounded-lg py-3 transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-taupe mt-8">
            Trouble accessing your account? Contact the school office.
          </p>
        </div>
      </div>

      {/* Right panel — signature element: a ledger-seal motif */}
      <div className="hidden md:flex relative items-center justify-center bg-ocean-sunset overflow-hidden">
        {/* Faint ledger lines — echoes a marked report sheet */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 47px, #C1E8FF 48px)",
          }}
        />

        <div className="relative z-10 max-w-sm px-10 text-center">
          {/* Seal badge — signature element */}
          <svg
            viewBox="0 0 160 160"
            className="w-32 h-32 mx-auto mb-8"
            aria-hidden="true"
          >
            <circle
              cx="80"
              cy="80"
              r="76"
              fill="none"
              stroke="#C1E8FF"
              strokeWidth="2"
              strokeDasharray="4 6"
            />
            <circle cx="80" cy="80" r="60" fill="#C1E8FF" opacity="0.08" />
            <text
              x="80"
              y="72"
              textAnchor="middle"
              fill="#C1E8FF"
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
              fill="#7DA0CA"
              fontFamily="var(--font-plexmono)"
              fontSize="9"
              letterSpacing="2"
            >
              RESULTS PORTAL
            </text>
          </svg>

          <h2 className="font-display text-3xl text-antique font-semibold mb-3">
            Every grade, on record.
          </h2>
          <p className="text-taupe">
            Students track their progress. Teachers post results in minutes.
            One record, always up to date.
          </p>
        </div>
      </div>
    </main>
  );
}
