import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const termId = req.nextUrl.searchParams.get("termId");

  const classFees = await db.classFee.findMany({
    where: termId ? { termId } : undefined,
    include: { class: true, term: true },
    orderBy: { class: { name: "asc" } },
  });
  return NextResponse.json({ classFees });
}

const lineItemSchema = z.object({
  label: z.string().min(1).max(80),
  amount: z.number().min(0).max(100_000_000),
});

const setSchema = z.object({
  classId: z.string().min(1),
  termId: z.string().min(1),
  lineItems: z.array(lineItemSchema).min(1),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = setSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Select a class, term, and at least one line item with a valid amount." },
      { status: 400 }
    );
  }
  const { classId, termId, lineItems } = parsed.data;
  const amount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const classFee = await db.classFee.upsert({
    where: { classId_termId: { classId, termId } },
    update: { amount, lineItems },
    create: { classId, termId, amount, lineItems },
    include: { class: true, term: true },
  });

  return NextResponse.json({ classFee });
}
