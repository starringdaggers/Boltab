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

  // Subject choice is the teacher's discretion once an admin has assigned
  // them to the class — access is gated by class assignment (see
  // /api/teacher/classes and /api/teacher/results), not by subject.
  const subjects: { id: string; name: string }[] = await db.subject.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ subjects });
}
