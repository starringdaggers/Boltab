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
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#2F2E71] to-[#6967FB]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Boltab Brilliant Schools crest" className="h-9 w-auto" />
            <span className="text-sm font-bold tracking-wide text-white uppercase">
              Boltab Brilliant Schools
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#A8A6E8]">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>
          <Link
            href="/login"
            className="bg-white text-[#2F2E71] text-sm font-semibold rounded-full px-5 py-2 hover:bg-[#F1F0FF] transition-colors"
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
            Boltab Brilliant Schools
            <br />
            <span className="text-indigo-600">Student &amp; Parent</span>
            <br />
            Portal
          </h1>

          <p className="text-slate-500 text-lg mb-8 max-w-md">
            Check term results, access report cards, and track academic
            progress.
