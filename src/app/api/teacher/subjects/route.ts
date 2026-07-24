import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const teacher = await db.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }

  const classId = req.nextUrl.searchParams.get("classId");

  // Only subjects this teacher has actually been assigned to by an admin —
  // scoped to a specific class if one is selected, so a teacher assigned
  // Math for one class can't pick English for a different class they teach.
  const assignments = await db.teacherAssignment.findMany({
    where: { teacherId: teacher.id, ...(classId ? { classId } : {}) },
    include: { subject: true },
  });
  const seen = new Set<string>();
  const subjects = assignments
    .filter((a) => (seen.has(a.subjectId) ? false : (seen.add(a.subjectId), true)))
    .map((a) => ({ id: a.subject.id, name: a.subject.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ subjects });
}
