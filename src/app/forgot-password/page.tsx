import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#163832] p-4 sm:p-8">
      <div className="w-full max-w-md bg-antique rounded-[2rem] shadow-2xl px-8 py-12 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-vandyke uppercase mb-1">
          Boltab
        </p>
        <h1 className="font-display text-2xl text-bistre font-semibold mb-4">
          Forgot your password?
        </h1>
        <p className="text-vandyke mb-8">
          Self-service password reset by email isn't set up yet — instead,
          the school office can reset your password for you directly.
          Reach out with your full name and role (student or teacher) and
          they'll set you up with a new one.
        </p>
        <Link
          href="/login"
          className="inline-block bg-choc hover:bg-choc-dark text-antique font-semibold rounded-full px-8 py-3 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
