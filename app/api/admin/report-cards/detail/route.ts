import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/adminAccess";
import { PSYCHOMOTOR_SKILLS, AFFECTIVE_TRAITS } from "@/lib/reportCardFields";

// Admin can view a student's full report card regardless of whether the
// term has been released or the student individually withheld — this is
// an oversight view, not the student-facing gated one.
export async function GET(req: NextRequest) {
  const session = await requireAdminAccess("reportCards");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const studentId = req.nextUrl.searchParams.get("studentId");
  const termId = req.nextUrl.searchParams.get("termId");
  if (!studentId || !termId) {
    return NextResponse.json({ error: "studentId and termId are required." }, { status: 400 });
  }

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: { user: { select: { name: true } }, class: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const term = await db.term.findUnique({ where: { id: termId } });
  if (!term) {
    return NextResponse.json({ error: "Term not found." }, { status: 404 });
  }

  const [results, reportCard, numberOnRoll] = await Promise.all([
    db.result.findMany({
      where: { studentId: student.id, termId },
      include: { subject: true },
      orderBy: { subject: { name: "asc" } },
    }),
    db.reportCard.findUnique({ where: { studentId_termId: { studentId: student.id, termId } } }),
    db.student.count({ where: { classId: student.classId } }),
  ]);

  const totalScore = results.reduce((sum, r) => sum + r.totalScore, 0);
  const totalObtainable = results.reduce((sum, r) => sum + r.totalObtainable, 0);
  const aggregatePercent = totalObtainable > 0 ? (totalScore / totalObtainable) * 100 : null;

  return NextResponse.json({
    student: {
      name: student.user.name,
      admissionNo: student.admissionNo,
      className: student.class.name,
    },
    term,
    numberOnRoll,
    results,
    reportCard,
    aggregatePercent,
    fields: { psychomotor: PSYCHOMOTOR_SKILLS, affective: AFFECTIVE_TRAITS },
  });
}
