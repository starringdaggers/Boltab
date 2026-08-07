import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/adminAccess";

export async function GET() {
  const session = await requireAdminAccess("subjects");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const subjects = await db.subject.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ subjects });
}

const createSchema = z.object({ name: z.string().min(1).max(50) });

export async function POST(req: NextRequest) {
  const session = await requireAdminAccess("subjects");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a subject name." }, { status: 400 });
  }

  const existing = await db.subject.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "A subject with this name already exists." }, { status: 409 });
  }

  const created = await db.subject.create({ data: { name: parsed.data.name } });
  return NextResponse.json({ subject: created }, { status: 201 });
}
