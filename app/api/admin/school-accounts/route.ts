import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const accounts = await db.schoolAccount.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ accounts });
}

const accountSchema = z.object({
  bankName: z.string().min(1).max(100),
  accountName: z.string().min(1).max(150),
  accountNumber: z.string().min(1).max(30),
  notes: z.string().max(300).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = accountSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Fill in the bank name, account name, and account number." }, { status: 400 });
  }

  const account = await db.schoolAccount.create({ data: parsed.data });
  return NextResponse.json({ account }, { status: 201 });
}
