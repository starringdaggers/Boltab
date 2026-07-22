import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const teacher = await db.teacher.findUnique({
    where: { userId: session.userId },
    include: {
      assignments: {
        include: { class: true, subject: true },
        orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
      },
    },
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }

  return NextResponse.json({ assignments: teacher.assignments });
}
