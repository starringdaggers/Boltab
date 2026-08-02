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

  const records: { date: Date; status: string }[] = await db.attendanceRecord.findMany({
    where: { studentId: student.id, termId },
    orderBy: { date: "desc" },
    select: { date: true, status: true },
  });

  const summary = {
    present: records.filter((r) => r.status === "PRESENT").length,
    late: records.filter((r) => r.status === "LATE").length,
    absent: records.filter((r) => r.status === "ABSENT").length,
    total: records.length,
  };

  return NextResponse.json({ summary, records });
}
