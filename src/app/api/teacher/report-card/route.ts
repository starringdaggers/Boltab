import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { PSYCHOMOTOR_SKILLS, AFFECTIVE_TRAITS } from "@/lib/reportCardFields";

async function getOwnTeacher(userId: string) {
  return db.teacher.findUnique({ where: { userId } });
}

export async function GET(req: NextRequest) {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const classId = req.nextUrl.searchParams.get("classId");
  const termId = req.nextUrl.searchParams.get("termId");
  const studentId = req.nextUrl.searchParams.get("studentId");

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

  const numberOnRoll = students.length;

  if (!studentId) {
    // Just return the roster so the UI can offer a student picker
    const existing = await db.reportCard.findMany({
      where: { termId, studentId: { in: students.map((s) => s.id) } },
      select: { studentId: true },
    });
    const startedIds = new Set(existing.map((r) => r.studentId));
    const roster = students.map((s) => ({
      studentId: s.id,
      name: s.user.name,
      admissionNo: s.admissionNo,
      started: startedIds.has(s.id),
    }));
    return NextResponse.json({ roster, numberOnRoll, isLocked: term.isLocked });
  }

  const student = students.find((s) => s.id === studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found in this class." }, { status: 404 });
  }

  const reportCard = await db.reportCard.findUnique({
    where: { studentId_termId: { studentId, termId } },
  });

  return NextResponse.json({
    student: { id: student.id, name: student.user.name, admissionNo: student.admissionNo },
    numberOnRoll,
    isLocked: term.isLocked,
    reportCard,
    fields: { psychomotor: PSYCHOMOTOR_SKILLS, affective: AFFECTIVE_TRAITS },
  });
}

const ratingsSchema = z.record(z.string(), z.number().min(1).max(5));

const saveSchema = z.object({
  studentId: z.string().min(1),
  termId: z.string().min(1),
  timesSchoolOpened: z.number().int().min(0).optional().nullable(),
  timesPresent: z.number().int().min(0).optional().nullable(),
  timesAbsent: z.number().int().min(0).optional().nullable(),
  nextTermBegins: z.string().max(100).optional().nullable(),
  psychomotor: ratingsSchema.optional().nullable(),
  affective: ratingsSchema.optional().nullable(),
  generalPerformance: z.string().max(100).optional().nullable(),
  classTeacherName: z.string().max(100).optional().nullable(),
  classTeacherComment: z.string().max(500).optional().nullable(),
  headmasterComment: z.string().max(500).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = saveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const { studentId, termId, ...fields } = parsed.data;

  const teacher = await getOwnTeacher(session.userId);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }

  const term = await db.term.findUnique({ where: { id: termId } });
  if (!term) {
    return NextResponse.json({ error: "Term not found." }, { status: 404 });
  }
  if (term.isLocked) {
    return NextResponse.json(
      { error: "This term is locked. Ask an admin to unlock it before editing." },
      { status: 409 }
    );
  }

  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  // Prisma's Json? columns need the explicit JsonNull sentinel to store a
  // real null — a plain `null` is ambiguous with "field not set" here.
  const data = {
    ...fields,
    psychomotor: fields.psychomotor === null || fields.psychomotor === undefined
      ? Prisma.JsonNull
      : fields.psychomotor,
    affective: fields.affective === null || fields.affective === undefined
      ? Prisma.JsonNull
      : fields.affective,
    updatedById: teacher.id,
  };

  const reportCard = await db.reportCard.upsert({
    where: { studentId_termId: { studentId, termId } },
    update: data,
    create: { studentId, termId, ...data },
  });

  return NextResponse.json({ reportCard });
}
