import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

async function getOwnTeacher(userId: string) {
  return db.teacher.findUnique({ where: { userId } });
}

async function isAssignedToClass(teacherId: string, classId: string) {
  const assignment = await db.teacherAssignment.findFirst({
    where: { teacherId, classId },
  });
  return !!assignment;
}

function startOfDay(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const classId = req.nextUrl.searchParams.get("classId");
  const termId = req.nextUrl.searchParams.get("termId");
  const dateParam = req.nextUrl.searchParams.get("date");
  if (!classId || !termId || !dateParam) {
    return NextResponse.json(
      { error: "classId, termId, and date are all required." },
      { status: 400 }
    );
  }

  const teacher = await getOwnTeacher(session.userId);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }
  if (!(await isAssignedToClass(teacher.id, classId))) {
    return NextResponse.json(
      { error: "You haven't been assigned to this class. Ask an admin to assign you to it." },
      { status: 403 }
    );
  }

  const date = startOfDay(dateParam);

  const students: { id: string; admissionNo: string; user: { name: string } }[] =
    await db.student.findMany({
      where: { classId },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    });

  const existing: { studentId: string; status: string }[] = await db.attendanceRecord.findMany({
    where: { classId, date },
  });
  const statusByStudentId = new Map(existing.map((e) => [e.studentId, e.status]));

  const roster = students.map((s) => ({
    studentId: s.id,
    name: s.user.name,
    admissionNo: s.admissionNo,
    status: statusByStudentId.get(s.id) || null,
  }));

  return NextResponse.json({ roster });
}

const entrySchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
});

const bulkSaveSchema = z.object({
  classId: z.string().min(1),
  termId: z.string().min(1),
  date: z.string().min(1),
  entries: z.array(entrySchema).min(1),
});

export async function POST(req: NextRequest) {
  const session = await requireRole("TEACHER");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = bulkSaveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const { classId, termId, date: dateParam, entries } = parsed.data;

  const teacher = await getOwnTeacher(session.userId);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
  }
  if (!(await isAssignedToClass(teacher.id, classId))) {
    return NextResponse.json(
      { error: "You haven't been assigned to this class. Ask an admin to assign you to it." },
      { status: 403 }
    );
  }

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

  const date = startOfDay(dateParam);

  let saved = 0;
  for (const entry of entries) {
    await db.attendanceRecord.upsert({
      where: { studentId_date: { studentId: entry.studentId, date } },
      update: { status: entry.status, classId, termId, markedById: teacher.id },
      create: {
        studentId: entry.studentId,
        classId,
        termId,
        date,
        status: entry.status,
        markedById: teacher.id,
      },
    });
    saved++;
  }

  return NextResponse.json({ saved });
}
