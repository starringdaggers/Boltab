import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { computeGrade, MAX_TEST_SCORE, MAX_EXAM_SCORE } from "@/lib/grading";

async function getOwnTeacher(userId: string) {
  return db.teacher.findUnique({ where: { userId } });
}

async function verifyAssignment(
  teacherId: string,
  classId: string,
  subjectId: string
) {
  return db.teacherAssignment.findUnique({
    where: {
      teacherId_classId_subjectId: { teacherId, classId, subjectId },
    },
  });
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

  const assignment = await verifyAssignment(teacher.id, classId, subjectId);
  if (!assignment) {
    return NextResponse.json(
      { error: "You're not assigned to this class/subject." },
      { status: 403 }
    );
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
    testScore: number;
    examScore: number;
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

  return NextResponse.json({ roster, term, isLocked: term.isLocked });
}

const scoreEntrySchema = z.object({
  studentId: z.string().min(1),
  testScore: z.number().min(0).max(MAX_TEST_SCORE),
  examScore: z.number().min(0).max(MAX_EXAM_SCORE),
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

  const teacher = await getOwnTeacher(session.userId);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }

  const assignment = await verifyAssignment(teacher.id, classId, subjectId);
  if (!assignment) {
    return NextResponse.json(
      { error: "You're not assigned to this class/subject." },
      { status: 403 }
    );
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
    const totalScore = entry.testScore + entry.examScore;
    const { grade } = computeGrade(totalScore);

    const result = await db.result.upsert({
      where: {
        studentId_subjectId_termId: {
          studentId: entry.studentId,
          subjectId,
          termId,
        },
      },
      update: {
        testScore: entry.testScore,
        examScore: entry.examScore,
        totalScore,
        grade,
        remark: entry.remark,
        uploadedById: teacher.id,
      },
      create: {
        studentId: entry.studentId,
        classId,
        subjectId,
        termId,
        testScore: entry.testScore,
        examScore: entry.examScore,
        totalScore,
        grade,
        remark: entry.remark,
        uploadedById: teacher.id,
      },
    });
    saved.push(result);
  }

  return NextResponse.json({ saved: saved.length });
}
