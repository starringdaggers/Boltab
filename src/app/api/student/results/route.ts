import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { checkResultsAccess } from "@/lib/resultsAccess";

export async function GET(req: NextRequest) {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const termId = req.nextUrl.searchParams.get("termId");
  if (!termId) {
    return NextResponse.json({ error: "termId is required." }, { status: 400 });
  }

  const student = await db.student.findUnique({ where: { userId: session.userId } });
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

  const results = await db.result.findMany({
    where: { studentId: student.id, termId },
    include: { subject: true },
    orderBy: { subject: { name: "asc" } },
  });

  const totalScore = results.reduce((sum, r) => sum + r.totalScore, 0);
  const totalObtainable = results.reduce((sum, r) => sum + r.totalObtainable, 0);
  const average = results.length > 0 ? totalScore / results.length : null;
  const aggregatePercent = totalObtainable > 0 ? (totalScore / totalObtainable) * 100 : null;

  return NextResponse.json({ term, results, average, aggregatePercent });
}
