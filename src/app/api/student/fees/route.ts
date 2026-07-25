import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await requireRole("STUDENT");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const termId = req.nextUrl.searchParams.get("termId");
  if (!termId) {
    return NextResponse.json({ error: "termId is required." }, { status: 400 });
  }

  const student = await db.student.findUnique({ where: { userId: session.userId } });
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
  }

  const [accounts, classFee, payments] = await Promise.all([
    db.schoolAccount.findMany({ orderBy: { createdAt: "asc" } }),
    db.classFee.findUnique({
      where: { classId_termId: { classId: student.classId, termId } },
    }),
    db.feePayment.findMany({
      where: { studentId: student.id, termId },
      select: {
        id: true,
        amountClaimed: true,
        receiptFileName: true,
        status: true,
        adminNote: true,
        submittedAt: true,
        reviewedAt: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const approvedTotal = payments
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + p.amountClaimed, 0);
  const feeAmount = classFee?.amount ?? null;
  const balance = feeAmount !== null ? Math.max(0, feeAmount - approvedTotal) : null;

  return NextResponse.json({ accounts, feeAmount, approvedTotal, balance, payments });
}
