import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentOverview() {
  const session = await getSession();

  const student = session
    ? await db.student.findUnique({ where: { userId: session.userId } })
    : null;

  // Find the most recently uploaded result to figure out which term to
  // summarize by default — this reflects "the latest results published for
  // me" rather than an arbitrary chronological guess.
  const latestResult:
    | { termId: string; term: { name: string; academicYear: string } }
    | null = student
    ? await db.result.findFirst({
        where: { studentId: student.id },
        orderBy: { uploadedAt: "desc" },
        include: { term: true },
      })
    : null;

  let average: number | null = null;
  let subjectCount = 0;

  if (student && latestResult) {
    const results: { totalScore: number }[] = await db.result.findMany({
      where: { studentId: student.id, termId: latestResult.termId },
    });
    subjectCount = results.length;
    average =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.totalScore, 0) / results.length
        : null;
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Welcome, {session?.name}
      </h1>
      <p className="text-vandyke mb-8">Here's a quick look at your progress.</p>

      {!latestResult ? (
        <p className="text-vandyke">
          No results have been published for you yet — check back once your
          teachers have entered scores.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 max-w-2xl">
          <div className="bg-white/40 border border-taupe/30 rounded-card p-6">
            <p className="font-mono text-xs tracking-wide text-vandyke uppercase mb-2">
              Latest term
            </p>
            <p className="font-display text-xl text-bistre font-semibold">
              {latestResult.term.name}
            </p>
            <p className="text-vandyke text-sm">{latestResult.term.academicYear}</p>
          </div>
          <div className="bg-white/40 border border-taupe/30 rounded-card p-6">
            <p className="font-mono text-xs tracking-wide text-vandyke uppercase mb-2">
              Average score
            </p>
            <p className="font-display text-4xl text-bistre font-semibold">
              {average !== null ? average.toFixed(1) : "—"}
            </p>
          </div>
          <div className="bg-white/40 border border-taupe/30 rounded-card p-6">
            <p className="font-mono text-xs tracking-wide text-vandyke uppercase mb-2">
              Subjects graded
            </p>
            <p className="font-display text-4xl text-bistre font-semibold">
              {subjectCount}
            </p>
          </div>
        </div>
      )}

      <Link
        href="/student/results"
        className="inline-block bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2.5 transition-colors"
      >
        View full results →
      </Link>
    </div>
  );
}
