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
    <main className="bg-antique text-bistre">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-ocean-sunset">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Boltab Brilliant Schools crest" className="h-10 w-auto" />
            <span className="font-mono text-xs tracking-[0.2em] text-antique uppercase">
              Boltab Brilliant Schools
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-taupe">
            <a href="#who-its-for" className="hover:text-antique transition-colors">
              Who it's for
            </a>
            <a href="#how-it-works" className="hover:text-antique transition-colors">
              How it works
            </a>
            <a href="#contact" className="hover:text-antique transition-colors">
              Contact
            </a>
          </nav>
          <Link
            href="/login"
            className="bg-choc hover:bg-choc-dark text-antique text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-choc uppercase mb-4">
            Results Portal
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-5">
            Every grade, in its place, the moment it's marked.
          </h1>
          <p className="text-vandyke text-lg mb-8 max-w-md">
            Teachers post scores in minutes. Students see them the moment
            they're published. No spreadsheets, no waiting for a paper
            report card.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-6 py-3 transition-colors"
            >
              Sign in
            </Link>
            <a
              href="#how-it-works"
              className="border border-taupe/50 hover:border-choc text-bistre font-medium rounded-lg px-6 py-3 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Hero graphic — term averages trending up */}
        <div className="relative bg-ocean-sunset rounded-card aspect-[4/3] overflow-hidden">
          <svg viewBox="0 0 500 380" className="absolute inset-0 w-full h-full" aria-hidden="true">
            {/* scattered decorative dots */}
            {[
              [40, 90], [120, 55], [370, 45], [455, 85], [430, 130], [60, 190],
              [400, 220], [470, 260], [45, 300], [340, 320], [120, 340],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2.2" fill="#FFFFFF" opacity="0.45" />
            ))}
            {/* trend line */}
            <polyline
              points="55,300 150,235 175,255 230,195 275,160 335,120 445,75"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray="1 8"
              strokeLinecap="round"
            />
            {[
              [55, 300], [150, 235], [175, 255], [230, 195], [275, 160], [335, 120], [445, 75],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="6" fill="#FFFFFF" />
            ))}
          </svg>
          <div className="absolute bottom-5 left-6 right-6">
            <p className="font-mono text-[10px] tracking-[0.15em] text-taupe uppercase">
              This term
            </p>
            <p className="font-display text-antique text-xl font-semibold">
              Averages, trending up.
            </p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="who-its-for" className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 flex justify-center">
          <div className="bg-white/40 border border-taupe/30 rounded-card p-6">
            <img
              src="/student-abdullahi.png"
              alt="A Boltab Brilliant Schools student in uniform, smiling with arms crossed on campus"
              className="w-56 md:w-64 h-auto rounded-card object-cover"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <p className="font-mono text-xs tracking-[0.2em] text-choc uppercase mb-4">
            Who it's for
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-5">
            One portal, three roles.
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-bistre">Students</p>
              <p className="text-vandyke text-sm">
                See results and report cards the moment they're released —
                no more waiting on a paper copy.
              </p>
            </div>
            <div>
              <p className="font-medium text-bistre">Teachers</p>
              <p className="text-vandyke text-sm">
                Enter scores for an assigned class in minutes, then fill in
                the rest of the report card in one place.
              </p>
            </div>
            <div>
              <p className="font-medium text-bistre">Admins</p>
              <p className="text-vandyke text-sm">
                Control when results go live, manage classes and staff, and
                keep one record of everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works / product mockup */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-choc uppercase mb-4">
            How it works
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-5">
            About Boltab Brilliant Schools
          </h2>
          <p className="text-vandyke mb-4">
            We built this portal to close the gap between a test being
            marked and a family knowing the result. A teacher enters scores
            once — the student sees it instantly, and it's saved as the
            permanent record for that term.
          </p>
          <p className="text-vandyke">
            No lost report cards, no manual re-entry, no guessing at an
            average. Just one record, always current.
          </p>
        </div>

        <div className="bg-white/50 border border-taupe/30 rounded-card p-5">
          <p className="font-mono text-[10px] tracking-wide text-vandyke uppercase mb-3">
            Term Results — Preview
          </p>
          <div className="space-y-2">
            {[
              { subject: "Mathematics", total: 82, grade: "A" },
              { subject: "English Language", total: 71, grade: "A" },
              { subject: "Basic Science", total: 64, grade: "B" },
              { subject: "Social Studies", total: 47, grade: "D" },
            ].map((row) => (
              <div
                key={row.subject}
                className="flex items-center justify-between bg-antique/60 rounded-lg px-4 py-2.5"
              >
                <span className="text-sm text-bistre">{row.subject}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-vandyke">{row.total}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      row.grade === "D"
                        ? "bg-status-warn/10 text-status-warn"
                        : "bg-status-pass/10 text-status-pass"
                    }`}
                  >
                    {row.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <p className="font-mono text-xs tracking-[0.2em] text-choc uppercase mb-4">
            Leadership
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-2">
            Oloyede Adetella Lateefat
          </h2>
          <p className="text-choc font-medium mb-5">
            Headmistress, Boltab Brilliant Schools
          </p>
          <p className="text-vandyke mb-6 max-w-md">
            "Every child's progress deserves to be seen clearly and shared
            quickly. This portal is part of how we keep that promise to our
            students and their families."
          </p>
          <a
            href="https://wa.me/2349036750884"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2.5 transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <div className="bg-white/40 border border-taupe/30 rounded-card p-6">
            <img
              src="/headmistress.png"
              alt="Oloyede Adetella Lateefat, Headmistress of Boltab Brilliant Schools"
              className="w-56 md:w-64 h-auto rounded-card"
            />
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-ocean-sunset">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 text-center">
          <h2 className="font-display text-2xl md:text-3xl text-antique font-semibold mb-4">
            Ready to check this term's results?
          </h2>
          <Link
            href="/login"
            className="inline-block bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-6 py-3 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="font-display text-bistre font-semibold">
            Boltab Brilliant Schools
          </p>
          <p className="text-vandyke text-sm mt-1">
            Trouble accessing your account? Contact the school office, or
            reach us on WhatsApp at{" "}
            <a
              href="https://wa.me/2349036750884"
              target="_blank"
              rel="noopener noreferrer"
              className="text-choc hover:underline"
            >
              0903 675 0884
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1">
          <p className="text-vandyke text-sm">
            © 2026 Boltab Brilliant Schools
          </p>
          <Link href="/privacy" className="text-choc text-sm hover:underline">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </main>
  );
}
