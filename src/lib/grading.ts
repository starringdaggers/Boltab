/**
 * Default grading scale (out of 100, where testScore + examScore = totalScore).
 * This is a reasonable starting default — adjust the thresholds here if
 * Boltab Brilliant Schools uses a different scale.
 */
export function computeGrade(totalScore: number): { grade: string; remark: string } {
  if (totalScore >= 70) return { grade: "A", remark: "Excellent" };
  if (totalScore >= 60) return { grade: "B", remark: "Very Good" };
  if (totalScore >= 50) return { grade: "C", remark: "Good" };
  if (totalScore >= 45) return { grade: "D", remark: "Pass" };
  if (totalScore >= 40) return { grade: "E", remark: "Weak Pass" };
  return { grade: "F", remark: "Fail" };
}

export const MAX_TEST_SCORE = 40;
export const MAX_EXAM_SCORE = 60;
