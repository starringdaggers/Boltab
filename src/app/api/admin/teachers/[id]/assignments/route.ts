import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

const assignSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = assignSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Select a class and subject." }, { status: 400 });
  }

  const existing = await db.teacherAssignment.findUnique({
    where: {
      teacherId_classId_subjectId: {
        teacherId: params.id,
        classId: parsed.data.classId,
        subjectId: parsed.data.subjectId,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Already assigned." }, { status: 409 });
  }

  const assignment = await db.teacherAssignment
    .create({
      data: {
        teacherId: params.id,
        classId: parsed.data.classId,
        subjectId: parsed.data.subjectId,
      },
      include: { class: true, subject: true },
    })
    .catch(() => null);

  if (!assignment) {
    return NextResponse.json({ error: "Couldn't create assignment." }, { status: 400 });
  }
  return NextResponse.json({ assignment }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { assignmentId } = await req.json().catch(() => ({ assignmentId: null }));
  if (!assignmentId) {
    return NextResponse.json({ error: "Missing assignment id." }, { status: 400 });
  }

  await db.teacherAssignment.delete({ where: { id: assignmentId } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
