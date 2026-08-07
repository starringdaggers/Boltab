import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  await db.adminDelegation.deleteMany({ where: { teacherId: params.teacherId } });
  return NextResponse.json({ ok: true });
}
