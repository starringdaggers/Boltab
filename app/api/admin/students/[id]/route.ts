import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminAccess } from "@/lib/adminAccess";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminAccess("students");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const student = await db.student.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, profilePictureUrl: true } },
      class: true,
    },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  // Every term this student has any record for — results, a report card, or
  // attendance — so nothing from past terms is ever hidden or lost, even
  // after the student has moved to a different class.
  const [results, reportCards, attendance, allTerms]: [
    { termId: string; totalScore: number }[],
    { termId: string; weightKg: number | null; heightCm: number | null; generalPerformance: string | null }[],
    { termId: string; status: string }[],
    { id: string; name: string; academicYear: string }[]
  ] = await Promise.all([
    db.result.findMany({
      where: { studentId: student.id },
      select: { termId: true, totalScore: true },
    }),
    db.reportCard.findMany({
      where: { studentId: student.id },
      select: { termId: true, weightKg: true, heightCm: true, generalPerformance: true },
    }),
    db.attendanceRecord.findMany({
      where: { studentId: student.id },
      select: { termId: true, status: true },
    }),
    db.term.findMany({ orderBy: [{ academicYear: "desc" }, { name: "asc" }] }),
  ]);

  const termIdsWithData = new Set([
    ...results.map((r) => r.termId),
    ...reportCards.map((rc) => rc.termId),
    ...attendance.map((a) => a.termId),
  ]);

  const history = allTerms
    .filter((t) => termIdsWithData.has(t.id))
    .map((term) => {
      const termResults = results.filter((r) => r.termId === term.id);
      const average =
        termResults.length > 0
          ? termResults.reduce((sum, r) => sum + r.totalScore, 0) / termResults.length
          : null;

      const termAttendance = attendance.filter((a) => a.termId === term.id);
      const present = termAttendance.filter((a) => a.status === "PRESENT").length;
      const late = termAttendance.filter((a) => a.status === "LATE").length;
      const attendancePercent =
        termAttendance.length > 0
          ? Math.round(((present + late) / termAttendance.length) * 100)
          : null;

      const reportCard = reportCards.find((rc) => rc.termId === term.id) || null;

      return {
        term: { id: term.id, name: term.name, academicYear: term.academicYear },
        subjectCount: termResults.length,
        average,
        attendancePercent,
        weightKg: reportCard?.weightKg ?? null,
        heightCm: reportCard?.heightCm ?? null,
        generalPerformance: reportCard?.generalPerformance ?? null,
      };
    });

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      profilePictureUrl: student.user.profilePictureUrl,
      admissionNo: student.admissionNo,
      class: student.class,
      dateOfBirth: student.dateOfBirth,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
    },
    history,
  });
}

const updateSchema = z.object({
  guardianName: z.string().max(100).optional().nullable(),
  guardianPhone: z.string().max(30).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminAccess("students");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const student = await db.student
    .update({
      where: { id: params.id },
      data: {
        guardianName: parsed.data.guardianName || null,
        guardianPhone: parsed.data.guardianPhone || null,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      },
    })
    .catch(() => null);

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
