import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Read-only for any signed-in user — teachers and students can view every
// timetable/roster, but only admins can create/edit/delete (see
// /api/admin/timetables). This route intentionally never mutates anything.
export async function GET() {
  const session = await requireRole("ADMIN", "TEACHER", "STUDENT");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const timetables = await db.timetable.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ timetables });
}
