import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const timetable = await db.timetable.findUnique({ where: { id: params.id } });
  if (!timetable) {
    return NextResponse.json({ error: "Timetable not found." }, { status: 404 });
  }
  return NextResponse.json({ timetable });
}

const gridSchema = z.object({
  title: z.string().min(1).max(120),
  columns: z.array(z.string().max(60)).min(1).max(20),
  rows: z
    .array(z.array(z.string().max(300)))
    .min(1)
    .max(60),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = gridSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Give the timetable a title, at least one column, and at least one row." },
      { status: 400 }
    );
  }
  const { title, columns, rows } = parsed.data;

  const mismatched = rows.find((r) => r.length !== columns.length);
  if (mismatched) {
    return NextResponse.json(
      { error: "Every row must have the same number of cells as there are columns." },
      { status: 400 }
    );
  }

  const timetable = await db.timetable
    .update({ where: { id: params.id }, data: { title, columns, rows } })
    .catch(() => null);

  if (!timetable) {
    return NextResponse.json({ error: "Timetable not found." }, { status: 404 });
  }
  return NextResponse.json({ timetable });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  await db.timetable.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
