import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

const accountSchema = z.object({
  bankName: z.string().min(1).max(100),
  accountName: z.string().min(1).max(150),
  accountNumber: z.string().min(1).max(30),
  notes: z.string().max(300).optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = accountSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Fill in the bank name, account name, and account number." }, { status: 400 });
  }

  const account = await db.schoolAccount
    .update({ where: { id: params.id }, data: parsed.data })
    .catch(() => null);
  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  return NextResponse.json({ account });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  await db.schoolAccount.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
