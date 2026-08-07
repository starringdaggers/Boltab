import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/adminAccess";

export async function GET() {
  const session = await requireAdminAccess("classes");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const classes = await db.class.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { students: true } } },
  });
  return NextResponse.json({ classes });
}

const createSchema = z.object({ name: z.string().min(1).max(50) });

export async function POST(req: NextRequest) {
  const session = await requireAdminAccess("classes");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a class name." }, { status: 400 });
  }

  const existing = await db.class.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "A class with this name already exists." }, { status: 409 });
  }

  const created = await db.class.create({ data: { name: parsed.data.name } });
  return NextResponse.json({ class: created }, { status: 201 });
}
