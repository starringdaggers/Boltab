import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Roughly caps the uploaded receipt at ~3MB (base64 text is ~33% larger
// than the original file, so this allows an original file up to ~2.2MB).
const MAX_RECEIPT_DATA_URL_LENGTH = 4_000_000;

const submitSchema = z.object({
  termId: z.string().min(1),
  amountClaimed: z.number().positive().max(100_000_000),
  receiptDataUrl: z
    .string()
    .min(1)
    .max(MAX_RECEIPT_DATA_URL_LENGTH, "Receipt file is too large. Please upload a smaller image (under ~2MB).")
    .refine((v) => v.startsWith("data:"), "Receipt must be a valid uploaded file."),
  receiptFileName: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = submitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid submission." },
      { status: 400 }
    );
  }

  const student = await db.student.findUnique({ where: { userId: session.userId } });
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
  }

  const term = await db.term.findUnique({ where: { id: parsed.data.termId } });
  if (!term) {
    return NextResponse.json({ error: "Term not found." }, { status: 404 });
  }

  const payment = await db.feePayment.create({
    data: {
      studentId: student.id,
      termId: parsed.data.termId,
      amountClaimed: parsed.data.amountClaimed,
      receiptDataUrl: parsed.data.receiptDataUrl,
      receiptFileName: parsed.data.receiptFileName,
    },
  });

  return NextResponse.json(
    {
      payment: {
        id: payment.id,
        amountClaimed: payment.amountClaimed,
        receiptFileName: payment.receiptFileName,
        status: payment.status,
        submittedAt: payment.submittedAt,
      },
    },
    { status: 201 }
  );
}
