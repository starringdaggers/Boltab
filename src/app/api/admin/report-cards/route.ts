import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const classId = req.nextUrl.searchParams.get("classId");
  const termId = req.nextUrl.searchParams.get("termId");
  if (!classId || !termId) {
    return NextResponse.json({ error: "classId and termId are required." }, { status: 400 });
  }

  const term = await db.term.findUnique({ where: { id: termId } });
  if (!term) {
    return NextResponse.json({ error: "Term not found." }, { status: 404 });
  }

  const students: { id: string; admissionNo: string; user: { name: string } }[] =
    await db.student.findMany({
      where: { classId },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    });
  // Belt-and-braces: guarantee correct alphabetical order in JS regardless
  // of the database's collation settings.
  students.sort((a, b) => a.user.name.localeCompare(b.user.name));

  const [reportCards, classFee, payments] = await Promise.all([
    db.reportCard.findMany({
      where: { termId, studentId: { in: students.map((s) => s.id) } },
      select: { studentId: true, isWithheld: true },
    }),
    db.classFee.findUnique({ where: { classId_termId: { classId, termId } } }),
    db.feePayment.findMany({
      where: {
        termId,
        studentId: { in: students.map((s) => s.id) },
        status: "APPROVED",
      },
      select: { studentId: true, amountClaimed: true },
    }),
  ]);
  const withheldByStudentId = new Map(reportCards.map((r) => [r.studentId, r.isWithheld]));
  const paidByStudentId = new Map<string, number>();
  for (const p of payments) {
    paidByStudentId.set(p.studentId, (paidByStudentId.get(p.studentId) || 0) + p.amountClaimed);
  }

  const roster = students.map((s) => {
    const paid = paidByStudentId.get(s.id) || 0;
    const feeBalance = classFee ? Math.max(0, classFee.amount - paid) : null;
    return {
      studentId: s.id,
      name: s.user.name,
      admissionNo: s.admissionNo,
      isWithheld: withheldByStudentId.get(s.id) || false,
      feeBalance,
    };
  });

  return NextResponse.json({ roster, term });
}

const saveSchema = z.object({
  studentId: z.string().min(1),
  termId: z.string().min(1),
  isWithheld: z.boolean(),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = saveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const { studentId, termId, isWithheld } = parsed.data;

  const [student, term] = await Promise.all([
    db.student.findUnique({ where: { id: studentId } }),
    db.term.findUnique({ where: { id: termId } }),
  ]);
  if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
  if (!term) return NextResponse.json({ error: "Term not found." }, { status: 404 });

  const reportCard = await db.reportCard.upsert({
    where: { studentId_termId: { studentId, termId } },
    update: { isWithheld },
    create: { studentId, termId, isWithheld },
  });

  return NextResponse.json({ reportCard });
}
