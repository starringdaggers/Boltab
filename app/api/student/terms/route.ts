import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const terms = await db.term.findMany({
    orderBy: [{ academicYear: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ terms });
}
