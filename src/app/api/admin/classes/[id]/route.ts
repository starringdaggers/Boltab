import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

const updateSchema = z.object({ name: z.string().min(1).max(50) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a class name." }, { status: 400 });
  }

  const updated = await db.class
    .update({ where: { id: params.id }, data: { name: parsed.data.name } })
    .catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "Class not found." }, { status: 404 });
  }
  return NextResponse.json({ class: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const studentCount = await db.student.count({ where: { classId: params.id } });
  if (studentCount > 0) {
    return NextResponse.json(
      { error: `Can't delete — ${studentCount} student(s) are still in this class.` },
      { status: 409 }
    );
  }

  await db.class.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
