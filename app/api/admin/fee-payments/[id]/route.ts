import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Full detail, including the receipt — fetched on demand when admin opens
// one payment to review it (kept out of the list view since receipts are
// large base64 strings).
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const payment = await db.feePayment.findUnique({
    where: { id: params.id },
    include: {
      student: { include: { user: { select: { name: true } }, class: true } },
      term: true,
    },
  });
  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  return NextResponse.json({ payment });
}

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z.string().max(300).optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const payment = await db.feePayment
    .update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        adminNote: parsed.data.adminNote,
        reviewedById: session.userId,
        reviewedAt: new Date(),
      },
    })
    .catch(() => null);

  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  return NextResponse.json({ payment });
}
