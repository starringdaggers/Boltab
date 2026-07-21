import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const terms = await db.term.findMany({
    orderBy: [{ academicYear: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ terms });
}

const createSchema = z.object({
  name: z.string().min(1).max(50),
  academicYear: z.string().min(1).max(20),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a term name and academic year, e.g. 'First Term', '2026/2027'." },
      { status: 400 }
    );
  }

  const existing = await db.term.findUnique({
    where: {
      name_academicYear: {
        name: parsed.data.name,
        academicYear: parsed.data.academicYear,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "This term already exists." }, { status: 409 });
  }

  const created = await db.term.create({ data: parsed.data });
  return NextResponse.json({ term: created }, { status: 201 });
}
