import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

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

  const results: {
    id: string;
    testScore: number;
    examScore: number;
    totalScore: number;
    grade: string;
    remark: string | null;
    subject: { name: string };
  }[] = await db.result.findMany({
    where: { studentId: student.id, termId },
    include: { subject: true },
    orderBy: { subject: { name: "asc" } },
  });

  const average =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.totalScore, 0) / results.length
      : null;

  return NextResponse.json({ term, results, average });
}
