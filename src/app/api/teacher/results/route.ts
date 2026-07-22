import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import {
  computeGrade,
  DEFAULT_FIRST_HALF_OBTAINABLE,
  DEFAULT_SECOND_HALF_OBTAINABLE,
  DEFAULT_EXAM_OBTAINABLE,
} from "@/lib/grading";

async function getOwnTeacher(userId: string) {
  return db.teacher.findUnique({ where: { userId } });
}

export async function GET(req: NextRequest) {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const classId = req.nextUrl.searchParams.get("classId");
  const subjectId = req.nextUrl.searchParams.get("subjectId");
  const termId = req.nextUrl.searchParams.get("termId");

  if (!classId || !subjectId || !termId) {
    return NextResponse.json(
      { error: "classId, subjectId, and termId are all required." },
      { status: 400 }
    );
  }

  const teacher = await getOwnTeacher(session.userId);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
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

  const existingResults: {
    studentId: string;
    firstHalfScore: number;
    firstHalfObtainable: number;
    secondHalfScore: number;
    secondHalfObtainable: number;
    examScore: number;
    examObtainable: number;
    remark: string | null;
  }[] = await db.result.findMany({
    where: { classId, subjectId, termId },
  });
  const resultByStudentId = new Map(
    existingResults.map((r) => [r.studentId, r])
  );

  const roster = students.map((s) => ({
    studentId: s.id,
    name: s.user.name,
    admissionNo: s.admissionNo,
    existingResult: resultByStudentId.get(s.id) || null,
  }));

  return NextResponse.json({
    roster,
    term,
    isLocked: term.isLocked,
    defaults: {
      firstHalfObtainable: DEFAULT_FIRST_HALF_OBTAINABLE,
      secondHalfObtainable: DEFAULT_SECOND_HALF_OBTAINABLE,
      examObtainable: DEFAULT_EXAM_OBTAINABLE,
    },
  });
}

const scoreEntrySchema = z.object({
  studentId: z.string().min(1),
  firstHalfScore: z.number().min(0),
  firstHalfObtainable: z.number().min(1),
  secondHalfScore: z.number().min(0),
  secondHalfObtainable: z.number().min(1),
  examScore: z.number().min(0),
  examObtainable: z.number().min(1),
  remark: z.string().max(200).optional(),
});

const bulkSaveSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  termId: z.string().min(1),
  entries: z.array(scoreEntrySchema).min(1),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = bulkSaveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission. Check that all scores are within range." },
      { status: 400 }
    );
  }
  const { classId, subjectId, termId, entries } = parsed.data;

  // Each entry's scores must not exceed what's obtainable for that column
  const outOfRange = entries.find(
    (e) =>
      e.firstHalfScore > e.firstHalfObtainable ||
      e.secondHalfScore > e.secondHalfObtainable ||
      e.examScore > e.examObtainable
  );
  if (outOfRange) {
    return NextResponse.json(
      { error: "One or more scores exceed the marks obtainable for that column." },
      { status: 400 }
    );
  }

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
      { error: "This term is locked. Ask an admin to unlock it before editing results." },
      { status: 409 }
    );
  }

  // Confirm every student actually belongs to this class (prevents a crafted
  // request from writing results against students in a different class)
  const validStudentIds = new Set(
    (
      (await db.student.findMany({
        where: { classId },
        select: { id: true },
      })) as { id: string }[]
    ).map((s) => s.id)
  );
  const invalidEntry = entries.find((e) => !validStudentIds.has(e.studentId));
  if (invalidEntry) {
    return NextResponse.json(
      { error: "One or more students don't belong to the selected class." },
      { status: 400 }
    );
  }

  const saved = [];
  for (const entry of entries) {
    const totalScore = entry.firstHalfScore + entry.secondHalfScore + entry.examScore;
    const totalObtainable =
      entry.firstHalfObtainable + entry.secondHalfObtainable + entry.examObtainable;
    const { grade } = computeGrade(totalScore, totalObtainable);

    const data = {
      firstHalfScore: entry.firstHalfScore,
      firstHalfObtainable: entry.firstHalfObtainable,
      secondHalfScore: entry.secondHalfScore,
      secondHalfObtainable: entry.secondHalfObtainable,
      examScore: entry.examScore,
      examObtainable: entry.examObtainable,
      totalScore,
      totalObtainable,
      grade,
      remark: entry.remark,
      uploadedById: teacher.id,
    };

    const result = await db.result.upsert({
      where: {
        studentId_subjectId_termId: {
          studentId: entry.studentId,
          subjectId,
          termId,
        },
      },
      update: data,
      create: {
        studentId: entry.studentId,
        classId,
        subjectId,
        termId,
        ...data,
      },
    });
    saved.push(result);
  }

  return NextResponse.json({ saved: saved.length });
}
