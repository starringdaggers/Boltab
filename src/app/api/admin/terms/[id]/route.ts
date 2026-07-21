import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  academicYear: z.string().min(1).max(20).optional(),
  isLocked: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const updated = await db.term
    .update({ where: { id: params.id }, data: parsed.data })
    .catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "Term not found." }, { status: 404 });
  }
  return NextResponse.json({ term: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const resultCount = await db.result.count({ where: { termId: params.id } });
  if (resultCount > 0) {
    return NextResponse.json(
      { error: `Can't delete — ${resultCount} result(s) already exist for this term.` },
      { status: 409 }
    );
  }

  await db.term.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
