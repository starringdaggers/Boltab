import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Boltab Brilliant Schools",
  description: "How Boltab Brilliant Schools collects, uses, and protects student and staff data on this results portal.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-antique min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-choc hover:underline mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl text-bistre font-semibold mb-2">
          Privacy Policy
        </h1>
        <p className="text-vandyke text-sm mb-8">Last updated: August 2026</p>

        <div className="prose-sm space-y-6 text-vandyke text-sm leading-relaxed">
          <section>
            <h2 className="font-display text-lg text-bistre font-semibold mb-2">
              What we collect
            </h2>
            <p>
              This portal stores information needed to run Boltab Brilliant
              Schools' academic records, including: student names, admission
              numbers, class placement, date of birth, parent/guardian names
              and phone numbers, exam and test scores, attendance records,
              school fee bills and submitted payment receipts, and an
              optional profile picture.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-bistre font-semibold mb-2">
              Why we collect it
            </h2>
            <p>
              This data exists solely to run the school's academic and
              administrative records — producing report cards, tracking
              attendance, managing fee bills, and giving students, parents,
              and staff access to the right information. We do not sell or
              share this data with third parties for advertising or any
              other unrelated purpose.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-bistre font-semibold mb-2">
              Who can see what
            </h2>
            <p>
              Students can only see their own results, report card, fees,
              and attendance. Teachers can see and enter data only for
              classes an admin has assigned or delegated to them. School
              administrators have full oversight. Access is controlled by
              individual login credentials — accounts are not shared, and
              each person is responsible for keeping their password private.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-bistre font-semibold mb-2">
              Children's data
            </h2>
            <p>
              Many of our students are minors. We collect only what's
              necessary for their education and treat this information with
              particular care. Parents/guardians may contact the school
              office to ask what information is held about their child or
              to request a correction.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-bistre font-semibold mb-2">
              How it's protected
            </h2>
            <p>
              The portal uses encrypted connections (HTTPS), hashed
              passwords, and login rate-limiting to reduce the risk of
              unauthorized access. No system is perfectly secure, and we
              continue to improve these protections over time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-bistre font-semibold mb-2">
              Contact
            </h2>
            <p>
              Questions about this policy or your data can be directed to
              the school office, or via WhatsApp at{" "}
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
          </section>

          <p className="text-xs text-taupe pt-6 border-t border-taupe/30">
            This page is a general starting point and hasn't been reviewed
            by a lawyer. Depending on your specific situation, you may want
            a qualified professional to review this against Nigeria's Data
            Protection Act/NDPR requirements before relying on it.
          </p>
        </div>
      </div>
    </main>
  );
}
