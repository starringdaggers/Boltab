import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

const assignSchema = z.object({
  classId: z.string().min(1),
  subjectIds: z.array(z.string().min(1)).min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = assignSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Select a class and at least one subject." },
      { status: 400 }
    );
  }
  const { classId, subjectIds } = parsed.data;

  const alreadyAssigned: { subjectId: string }[] = await db.teacherAssignment.findMany({
    where: { teacherId: params.id, classId },
    select: { subjectId: true },
  });
  const assignedSet = new Set(alreadyAssigned.map((a) => a.subjectId));
  const toCreate = subjectIds.filter((id) => !assignedSet.has(id));

  if (toCreate.length === 0) {
    return NextResponse.json(
      { error: "Already assigned to every subject you selected for this class." },
      { status: 409 }
    );
  }

  await db.teacherAssignment.createMany({
    data: toCreate.map((subjectId) => ({
      teacherId: params.id,
      classId,
      subjectId,
    })),
  });

  return NextResponse.json({ created: toCreate.length }, { status: 201 });
}

const deleteSchema = z.object({
  // Accept either a single id (older clients) or a list (bulk delete from checkboxes)
  assignmentId: z.string().min(1).optional(),
  assignmentIds: z.array(z.string().min(1)).optional(),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole("ADMIN");
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ids = parsed.data.assignmentIds || (parsed.data.assignmentId ? [parsed.data.assignmentId] : []);
  if (ids.length === 0) {
    return NextResponse.json({ error: "No assignments selected." }, { status: 400 });
  }

  const result = await db.teacherAssignment.deleteMany({
    where: { id: { in: ids }, teacherId: params.id },
  });

  return NextResponse.json({ deleted: result.count });
}
