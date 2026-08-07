import Link from "next/link";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Boltab Brilliant Schools",
  url: "https://boltab.vercel.app",
  logo: "https://boltab.vercel.app/logo.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "27, Liberty Street, Olugba Ilogbo Asowo",
    addressLocality: "Otta",
    addressRegion: "Ogun State",
    addressCountry: "NG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: "+2349036750884",
    contactOption: "WhatsApp",
  },
};

export default function LandingPage() {
  return (
    <main className="bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-indigo-700 to-indigo-500">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Boltab Brilliant Schools crest" className="h-9 w-auto" />
            <span className="text-sm font-bold tracking-wide text-white uppercase">
              Boltab Brilliant Schools
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-indigo-100">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>
          <Link
            href="/login"
            className="bg-white text-indigo-700 text-sm font-semibold rounded-full px-5 py-2 hover:bg-indigo-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide uppercase rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Results Portal
          </span>

          <h1 className="text-5xl md:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
            Welcome to
            <br />
            <span className="text-indigo-600">Boltab</span>
            <br />
            School&apos;s
            <br />
            Students Portal
          </h1>

          <p className="text-slate-500 text-lg mb-8 max-w-md">
            Scores posted by teachers. Seen instantly by students and
            families. One record, always current.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full px-6 py-3.5 transition-colors inline-flex items-center gap-2"
            >
              Sign in to portal <span aria-hidden="true">→</span>
            </Link>
            <a
              href="#about"
              className="text-indigo-600 font-medium hover:underline text-sm"
            >
              Learn about the school
            </a>
          </div>
        </div>

        {/* Hero photo — real Boltab student, framed */}
        <div className="relative flex justify-center md:justify-end">
          <div className="relative w-full max-w-sm">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-indigo-600 text-white text-[11px] font-semibold tracking-wide uppercase rounded-full px-4 py-1.5 whitespace-nowrap">
              Boltab Student
            </span>
            <div className="bg-indigo-950 rounded-[2rem] p-3">
              <img
                src="/student-abdullahi.png"
                alt="A Boltab Brilliant Schools student in uniform, smiling with arms crossed on campus"
                className="w-full aspect-[4/5] object-cover rounded-[1.5rem]"
              />
            </div>

            <div className="absolute -bottom-6 left-6 right-6 bg-indigo-950 text-white rounded-2xl px-5 py-3.5 shadow-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-wide uppercase text-indigo-300">
                  This term
                </p>
                <p className="font-semibold text-sm">Averages, trending up.</p>
                <p className="text-xs text-indigo-300">+12% vs last term</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 bg-white/10 text-[11px] font-medium rounded-full px-3 py-1.5 whitespace-nowrap">
                ✓ Enrolled
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-slate-50 rounded-t-[2.5rem] py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <p className="text-indigo-600 text-xs font-semibold tracking-wide uppercase mb-3">
            Who it&apos;s for
          </p>
          <h2 className="text-3xl md:text-4xl font-black mb-10 max-w-lg leading-tight">
            One portal. Three people who need it most.
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Students card */}
            <div className="bg-indigo-950 text-white rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-4 text-lg">
                  🎓
                </div>
                <p className="text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-2">
                  For students
                </p>
                <p className="text-xl font-bold mb-2">
                  See results the moment they&apos;re posted
                </p>
                <p className="text-indigo-200 text-sm">
                  Every subject, every term, in one place — no more waiting
                  on a printed report card.
                </p>
              </div>
              <div className="mt-8">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-4/5 rounded-full bg-indigo-400" />
                </div>
                <p className="text-right text-xs text-indigo-300 mt-1.5">80%</p>
              </div>
            </div>

            {/* Teachers card */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-3xl p-7">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center mb-4 text-lg">
                📝
              </div>
              <p className="text-indigo-100 text-xs font-semibold tracking-wide uppercase mb-2">
                For teachers
              </p>
              <p className="text-xl font-bold mb-2">
                Post a whole class in minutes
              </p>
              <p className="text-indigo-100 text-sm mb-5">
                Enter scores once — totals and grades calculate
                automatically.
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Maths", value: 82 },
                  { label: "English", value: 71 },
                  { label: "Science", value: 64 },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3 text-sm">
                    <span className="w-16 text-indigo-100">{s.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admins card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7 md:col-span-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 text-lg">
                🏫
              </div>
              <p className="text-indigo-600 text-xs font-semibold tracking-wide uppercase mb-2">
                For admins
              </p>
              <p className="text-xl font-bold mb-2">
                Full oversight, one dashboard
              </p>
              <p className="text-slate-500 text-sm mb-5">
                Manage classes, subjects, and staff. Lock a term once results
                are final.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Classes", "Subjects", "Staff", "Terms"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full px-3.5 py-1.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the school */}
      <section id="about" className="max-w-6xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-14 items-start">
        <div>
          <p className="text-indigo-600 text-xs font-semibold tracking-wide uppercase mb-3">
            About the school
          </p>
          <h2 className="text-3xl font-black mb-5 leading-tight">
            Boltab Brilliant Schools —{" "}
            <span className="text-indigo-600">built on clarity</span>
          </h2>
          <p className="text-slate-500 mb-4">
            We built this portal to close the gap between a test being
            marked and a family knowing the result. A teacher enters scores
            once — the student sees it instantly, saved as the permanent
            record for that term.
          </p>
          <p className="text-slate-500 mb-10">
            No lost report cards, no manual re-entry, no guessing at an
            average. Just one record, always current.
          </p>

          <div className="flex items-center gap-3">
            {[
              { n: "01", label: "Teacher enters scores" },
              { n: "02", label: "Grades auto-calculated" },
              { n: "03", label: "Student sees results" },
            ].map((step, i) => (
              <div key={step.n} className="flex items-center gap-3">
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold mb-1.5">
                    {step.n}
                  </span>
                  <p className="text-xs text-slate-500 max-w-[6rem]">{step.label}</p>
                </div>
                {i < 2 && <span className="w-8 h-px bg-slate-300 mb-5" />}
              </div>
            ))}
          </div>
        </div>

        {/* Term results preview */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">
              Term Results — Preview
            </p>
            <span className="bg-status-pass/10 text-status-pass text-[11px] font-semibold rounded-full px-2.5 py-1">
              Live
            </span>
          </div>
          <div className="space-y-1">
            {[
              { subject: "Mathematics", score: 82, grade: "A" },
              { subject: "English Language", score: 71, grade: "A" },
              { subject: "Basic Science", score: 64, grade: "B" },
              { subject: "Social Studies", score: 47, grade: "D" },
            ].map((r) => (
              <div
                key={r.subject}
                className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm text-slate-700">{r.subject}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-slate-900">{r.score}</span>
                  <span
                    className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                      r.grade === "D"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {r.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-2">
            <span className="text-sm text-slate-500">Class average</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-indigo-500" />
              </div>
              <span className="text-sm font-semibold text-slate-900">66%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
        <div className="bg-indigo-950 rounded-[2.5rem] p-8 md:p-10 grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <img
            src="/headmistress.png"
            alt="Oloyede Adetella Lateefat, Headmistress of Boltab Brilliant Schools"
            className="w-40 md:w-48 h-auto mx-auto md:mx-0 rounded-2xl"
          />
          <div>
            <p className="text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-3">
              Leadership
            </p>
            <blockquote className="text-white text-lg md:text-xl font-medium leading-snug border-l-2 border-indigo-500 pl-4 mb-4">
              &ldquo;Every child&apos;s progress deserves to be seen clearly
              and shared quickly. This portal is part of how we keep that
              promise to our students and their families.&rdquo;
            </blockquote>
            <p className="text-white font-semibold">Oloyede Adetella Lateefat</p>
            <p className="text-indigo-300 text-sm mb-5">
              Headmistress, Boltab Brilliant Schools
            </p>
            <a
              href="https://wa.me/2349036750884"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
        <div className="bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-indigo-200 text-xs font-semibold tracking-wide uppercase mb-3">
              Get started
            </p>
            <h2 className="text-3xl font-black text-white mb-2 leading-tight">
              Ready to check this term&apos;s results?
            </h2>
            <p className="text-indigo-100 max-w-md">
              Sign in to view your results, post scores, or manage your
              school — all in one place.
            </p>
          </div>
          <Link
            href="/login"
            className="bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-full px-6 py-3.5 whitespace-nowrap transition-colors inline-flex items-center gap-2"
          >
            Sign in to portal <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Boltab Brilliant Schools crest" className="h-8 w-auto" />
            <div>
              <p className="font-semibold text-sm">Boltab Brilliant Schools</p>
              <p className="text-slate-400 text-xs">Results Portal</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            Need help? WhatsApp:{" "}
            <a
              href="https://wa.me/2349036750884"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              0903 675 0884
            </a>
          </p>
          <p className="text-slate-400 text-sm">
            © 2026 Boltab Brilliant Schools ·{" "}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
