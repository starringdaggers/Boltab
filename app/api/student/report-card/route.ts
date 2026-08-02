import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { PSYCHOMOTOR_SKILLS, AFFECTIVE_TRAITS } from "@/lib/reportCardFields";
import { checkResultsAccess } from "@/lib/resultsAccess";

export async function GET(req: NextRequest) {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const termId = req.nextUrl.searchParams.get("termId");
  if (!termId) {
    return NextResponse.json({ error: "termId is required." }, { status: 400 });
  }

  const student = await db.student.findUnique({
    where: { userId: session.userId },
    include: { user: { select: { name: true } }, class: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
  }

  const term = await db.term.findUnique({ where: { id: termId } });
  if (!term) {
    return NextResponse.json({ error: "Term not found." }, { status: 404 });
  }

  const access = await checkResultsAccess(student.id, term);
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason }, { status: 403 });
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
