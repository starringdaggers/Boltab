import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status"); // PENDING | APPROVED | REJECTED | omitted = all

  const payments = await db.feePayment.findMany({
    where: status ? { status } : undefined,
    include: {
      student: { include: { user: { select: { name: true } }, class: true } },
      term: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  // Receipts can be large base64 strings — omit from the list view, the
  // single-payment fetch (or a dedicated receipt endpoint) returns it.
  const trimmed = payments.map(({ receiptDataUrl, ...p }) => p);

  return NextResponse.json({ payments: trimmed });
}
