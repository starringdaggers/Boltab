import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const subjects = await db.subject.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ subjects });
}
