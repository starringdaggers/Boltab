import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/adminAccess";

export async function GET(req: NextRequest) {
  const session = await requireAdminAccess("attendance");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const classId = req.nextUrl.searchParams.get("classId");
  const termId = req.nextUrl.searchParams.get("termId");
  if (!classId || !termId) {
    return NextResponse.json({ error: "classId and termId are required." }, { status: 400 });
  }

  const students: { id: string; admissionNo: string; user: { name: string } }[] =
    await db.student.findMany({
      where: { classId },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    });

  const records: { studentId: string; status: string }[] = await db.attendanceRecord.findMany({
    where: { classId, termId },
    select: { studentId: true, status: true },
  });

  const roster = students.map((s) => {
    const own = records.filter((r) => r.studentId === s.id);
    const present = own.filter((r) => r.status === "PRESENT").length;
    const late = own.filter((r) => r.status === "LATE").length;
    const absent = own.filter((r) => r.status === "ABSENT").length;
    const total = own.length;
    const percent = total > 0 ? Math.round(((present + late) / total) * 100) : null;
    return {
      studentId: s.id,
      name: s.user.name,
      admissionNo: s.admissionNo,
      present,
      late,
      absent,
      total,
      percent,
    };
  });

  return NextResponse.json({ roster });
}
