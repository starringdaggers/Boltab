import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const requests = await db.profilePictureRequest.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, name: true, email: true, role: true, profilePictureUrl: true } } },
    orderBy: { submittedAt: "asc" },
  });

  return NextResponse.json({ requests });
}
