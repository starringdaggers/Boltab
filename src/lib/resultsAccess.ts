import { db } from "@/lib/db";

/**
 * Checks whether a student is allowed to see their results/report card for
 * a given term. Two gates, both admin-controlled:
 *   1. The term itself must be released (Term.resultsReleased)
 *   2. That specific student's report card must not be individually
 *      withheld (ReportCard.isWithheld), even if the term is released
 */
export async function checkResultsAccess(
  studentId: string,
  term: { id: string; resultsReleased: boolean }
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  if (!term.resultsReleased) {
    return {
      allowed: false,
      reason: "Results for this term haven't been released yet. Please check back later.",
    };
  }

  const reportCard = await db.reportCard.findUnique({
    where: { studentId_termId: { studentId, termId: term.id } },
    select: { isWithheld: true },
  });

  if (reportCard?.isWithheld) {
    return {
      allowed: false,
      reason: "Your report card for this term is currently withheld. Please contact the school administration.",
    };
  }

  return { allowed: true };
}
