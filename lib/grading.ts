/**
 * Subject "performance" rating, based on percentage of marks obtainable.
 * This mirrors the word ratings used on the school's paper report card
 * (Excellent / V.Good / Good / Fair / Poor) rather than letter grades.
 * Adjust the thresholds here if Boltab Brilliant Schools uses a different scale.
 */
export function computeGrade(
  scoreObtained: number,
  scoreObtainable: number
): { grade: string; remark: string } {
  const pct = scoreObtainable > 0 ? (scoreObtained / scoreObtainable) * 100 : 0;
  if (pct >= 75) return { grade: "Excellent", remark: "Excellent" };
  if (pct >= 60) return { grade: "V.Good", remark: "Very Good" };
  if (pct >= 50) return { grade: "Good", remark: "Good" };
  if (pct >= 40) return { grade: "Fair", remark: "Fair" };
  return { grade: "Poor", remark: "Poor" };
}

// Default "marks obtainable" ceilings for each column of the continuous
// assessment sheet. Teachers can adjust the obtainable marks per subject
// when entering scores if a subject is weighted differently.
export const DEFAULT_FIRST_HALF_OBTAINABLE = 20;
export const DEFAULT_SECOND_HALF_OBTAINABLE = 20;
export const DEFAULT_EXAM_OBTAINABLE = 60;

/** Percentage threshold at or above which a student's term aggregate earns the celebration popup. */
export const CELEBRATION_AGGREGATE_THRESHOLD = 70;
