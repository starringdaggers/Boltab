import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const teacher = await db.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }

  // Only classes this teacher has actually been assigned to by an admin —
  // teachers can't enter results or report cards for classes outside this list.
  const assignments = await db.teacherAssignment.findMany({
    where: { teacherId: teacher.id },
    include: { class: true },
  });
  const seen = new Set<string>();
  const classes = assignments
    .filter((a) => (seen.has(a.classId) ? false : (seen.add(a.classId), true)))
    .map((a) => ({ id: a.class.id, name: a.class.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ classes });
}
