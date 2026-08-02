import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

const toggleSchema = z.object({ isReleased: z.boolean() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = toggleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const classFee = await db.classFee
    .update({
      where: { id: params.id },
      data: {
        isReleased: parsed.data.isReleased,
        releasedAt: parsed.data.isReleased ? new Date() : null,
      },
      include: { class: true, term: true },
    })
    .catch(() => null);

  if (!classFee) {
    return NextResponse.json({ error: "Fee bill not found." }, { status: 404 });
  }
  return NextResponse.json({ classFee });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  await db.classFee.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
