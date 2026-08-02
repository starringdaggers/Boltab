import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Lets a teacher voluntarily drop one of their own class/subject
// assignments. An admin can always re-assign it later from their side.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const teacher = await db.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }

  const assignment = await db.teacherAssignment.findUnique({ where: { id: params.id } });
  if (!assignment || assignment.teacherId !== teacher.id) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  await db.teacherAssignment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
